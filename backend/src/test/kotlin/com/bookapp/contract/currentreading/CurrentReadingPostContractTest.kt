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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CurrentReadingPostContractTest(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val objectMapper: ObjectMapper,
) {
    @Test
    fun `accepts browser preflight requests from the local ui`() {
        mockMvc.perform(
            options("/api/v1/current-reading-posts")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "content-type,x-user-id,x-user-name"),
        )
            .andExpect(status().isOk)
            .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
    }

    @Test
    fun `accepts browser preflight requests from a vite fallback port`() {
        mockMvc.perform(
            options("/api/v1/current-reading-posts")
                .header("Origin", "http://localhost:5174")
                .header("Access-Control-Request-Method", "POST")
                .header("Access-Control-Request-Headers", "content-type,x-user-id,x-user-name"),
        )
            .andExpect(status().isOk)
            .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5174"))
    }

    @Test
    fun `includes cors headers on api responses for the local ui`() {
        mockMvc.perform(
            post("/api/v1/current-reading-posts")
                .header("Origin", "http://localhost:5173")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(TestUsers.headers().toMockHttpHeaders())
                .content(objectMapper.writeValueAsString(mapOf("bookTitle" to "Dune", "rating" to 5))),
        )
            .andExpect(status().isCreated)
            .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
    }

    @Test
    fun `creates and replaces the authenticated user's post`() {
        val payload = mapOf("bookTitle" to "Dune", "rating" to 5)

        mockMvc.perform(
            post("/api/v1/current-reading-posts")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(TestUsers.headers().toMockHttpHeaders())
                .content(objectMapper.writeValueAsString(payload)),
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.bookTitle", equalTo("Dune")))
            .andExpect(jsonPath("$.ownedByCurrentUser", equalTo(true)))

        mockMvc.perform(
            post("/api/v1/current-reading-posts")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(TestUsers.headers().toMockHttpHeaders())
                .content(objectMapper.writeValueAsString(mapOf("bookTitle" to "Hyperion", "rating" to 4))),
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.bookTitle", equalTo("Hyperion")))
    }

    @Test
    fun `returns validation details for invalid input`() {
        mockMvc.perform(
            post("/api/v1/current-reading-posts")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(TestUsers.headers().toMockHttpHeaders())
                .content(objectMapper.writeValueAsString(mapOf("bookTitle" to "   ", "rating" to 7))),
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode", equalTo("CURRENT_READING_VALIDATION_FAILED")))
    }

    @Test
    fun `returns unauthorized when no identity headers are present`() {
        mockMvc.perform(
            post("/api/v1/current-reading-posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(mapOf("bookTitle" to "Dune", "rating" to 5))),
        )
            .andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.errorCode", equalTo("CURRENT_READING_UNAUTHORIZED")))
    }
}

private fun Map<String, String>.toMockHttpHeaders() = org.springframework.http.HttpHeaders().apply {
    this@toMockHttpHeaders.forEach(::add)
}

