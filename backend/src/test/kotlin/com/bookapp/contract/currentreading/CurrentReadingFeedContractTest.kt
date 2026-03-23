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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CurrentReadingFeedContractTest(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val objectMapper: ObjectMapper,
) {
    @Test
    fun `returns an empty feed when no posts exist`() {
        mockMvc.perform(get("/api/v1/current-reading-posts"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.items.length()", equalTo(0)))
    }

    @Test
    fun `returns active posts with response fields`() {
        mockMvc.perform(
            post("/api/v1/current-reading-posts")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(TestUsers.headers("user-1", "User One").toMockHttpHeaders())
                .content(objectMapper.writeValueAsString(mapOf("bookTitle" to "Dune", "rating" to 5))),
        ).andExpect(status().isCreated)

        mockMvc.perform(
            post("/api/v1/current-reading-posts")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(TestUsers.headers("user-2", "User Two").toMockHttpHeaders())
                .content(objectMapper.writeValueAsString(mapOf("bookTitle" to "Hyperion", "rating" to 4))),
        ).andExpect(status().isCreated)

        mockMvc.perform(get("/api/v1/current-reading-posts").headers(TestUsers.headers("user-1", "User One").toMockHttpHeaders()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.items.length()", equalTo(2)))
            .andExpect(jsonPath("$.items[0].bookTitle", equalTo("Hyperion")))
            .andExpect(jsonPath("$.items[1].bookTitle", equalTo("Dune")))
            .andExpect(jsonPath("$.items[1].ownedByCurrentUser", equalTo(true)))
    }
}

private fun Map<String, String>.toMockHttpHeaders() = org.springframework.http.HttpHeaders().apply {
    this@toMockHttpHeaders.forEach(::add)
}

