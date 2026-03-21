package com.bookapp.contract.profile

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
class ProfileSummaryContractTest(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val objectMapper: ObjectMapper,
) {
    @Test
    fun `returns unauthorized when no active owner context is available`() {
        mockMvc.perform(get("/api/v1/profile/me"))
            .andExpect(status().isUnauthorized)
            .andExpect(jsonPath("$.errorCode", equalTo("PROFILE_UNAUTHORIZED")))
    }

    @Test
    fun `returns the active user profile summary with a zero default`() {
        mockMvc.perform(get("/api/v1/profile/me").headers(TestUsers.headers("reader-3", "Reader Three").toMockHttpHeaders()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.userId", equalTo("reader-3")))
            .andExpect(jsonPath("$.displayName", equalTo("Reader Three")))
            .andExpect(jsonPath("$.booksReadCount", equalTo(0)))
    }

    @Test
    fun `returns the number of distinct books recorded for the active user`() {
        createPost("reader-4", "Reader Four", "Dune", 5)
        createPost("reader-4", "Reader Four", "Project Hail Mary", 4)
        createPost("reader-5", "Reader Five", "Ancillary Justice", 5)

        mockMvc.perform(get("/api/v1/profile/me").headers(TestUsers.headers("reader-4", "Reader Four").toMockHttpHeaders()))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.userId", equalTo("reader-4")))
            .andExpect(jsonPath("$.displayName", equalTo("Reader Four")))
            .andExpect(jsonPath("$.booksReadCount", equalTo(2)))
    }

    @Test
    fun `returns another reader profile by user id`() {
        createPost("reader-6", "Reader Six", "Dune", 5)
        createPost("reader-6", "Reader Six", "Hyperion", 4)

        mockMvc.perform(get("/api/v1/profiles/reader-6"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.userId", equalTo("reader-6")))
            .andExpect(jsonPath("$.displayName", equalTo("Reader Six")))
            .andExpect(jsonPath("$.booksReadCount", equalTo(2)))
    }

    @Test
    fun `returns not found when another reader profile is unknown`() {
        mockMvc.perform(get("/api/v1/profiles/missing-reader"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.errorCode", equalTo("PROFILE_NOT_FOUND")))
    }

    @Test
    fun `returns all known reader profile summaries`() {
        createPost("reader-7", "Ada Reader", "Dune", 5)
        createPost("reader-8", "Ben Reader", "Hyperion", 4)
        createPost("reader-8", "Ben Reader", "Project Hail Mary", 5)

        mockMvc.perform(get("/api/v1/profiles"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.items.length()", equalTo(2)))
            .andExpect(jsonPath("$.items[0].displayName", equalTo("Ada Reader")))
            .andExpect(jsonPath("$.items[0].booksReadCount", equalTo(1)))
            .andExpect(jsonPath("$.items[1].displayName", equalTo("Ben Reader")))
            .andExpect(jsonPath("$.items[1].booksReadCount", equalTo(2)))
    }

    private fun createPost(userId: String, displayName: String, bookTitle: String, rating: Int) {
        mockMvc.perform(
            post("/api/v1/current-reading-posts")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(TestUsers.headers(userId, displayName).toMockHttpHeaders())
                .content(objectMapper.writeValueAsString(mapOf("bookTitle" to bookTitle, "rating" to rating))),
        ).andExpect(status().is2xxSuccessful)
    }
}

private fun Map<String, String>.toMockHttpHeaders() = org.springframework.http.HttpHeaders().apply {
    this@toMockHttpHeaders.forEach(::add)
}
