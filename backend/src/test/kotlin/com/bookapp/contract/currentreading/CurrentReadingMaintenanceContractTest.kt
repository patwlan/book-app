package com.bookapp.contract.currentreading

import com.fasterxml.jackson.databind.ObjectMapper
import com.bookapp.support.TestUsers
import org.hamcrest.Matchers.equalTo
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CurrentReadingMaintenanceContractTest(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val objectMapper: ObjectMapper,
) {
    @Test
    fun `returns not found when updating without an active post`() {
        mockMvc.perform(
            put("/api/v1/current-reading-posts/me")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(TestUsers.headers().toMockHttpHeaders())
                .content(objectMapper.writeValueAsString(mapOf("bookTitle" to "Dune", "rating" to 5))),
        )
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.errorCode", equalTo("CURRENT_READING_NOT_FOUND")))
    }

    @Test
    fun `updates and deletes the owner's post`() {
        mockMvc.perform(
            post("/api/v1/current-reading-posts")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(TestUsers.headers().toMockHttpHeaders())
                .content(objectMapper.writeValueAsString(mapOf("bookTitle" to "Dune", "rating" to 5))),
        ).andExpect(status().isCreated)

        mockMvc.perform(
            put("/api/v1/current-reading-posts/me")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(TestUsers.headers().toMockHttpHeaders())
                .content(objectMapper.writeValueAsString(mapOf("bookTitle" to "Project Hail Mary", "rating" to 4))),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.bookTitle", equalTo("Project Hail Mary")))

        mockMvc.perform(delete("/api/v1/current-reading-posts/me").headers(TestUsers.headers().toMockHttpHeaders()))
            .andExpect(status().isNoContent)

        mockMvc.perform(delete("/api/v1/current-reading-posts/me").headers(TestUsers.headers().toMockHttpHeaders()))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `returns unauthorized when identity headers are missing`() {
        mockMvc.perform(delete("/api/v1/current-reading-posts/me"))
            .andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.errorCode", equalTo("CURRENT_READING_UNAUTHORIZED")))
    }
}

private fun Map<String, String>.toMockHttpHeaders() = org.springframework.http.HttpHeaders().apply {
    this@toMockHttpHeaders.forEach(::add)
}

