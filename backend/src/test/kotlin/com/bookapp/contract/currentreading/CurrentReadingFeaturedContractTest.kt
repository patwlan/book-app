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
class CurrentReadingFeaturedContractTest(
    @Autowired private val mockMvc: MockMvc,
    @Autowired private val objectMapper: ObjectMapper,
) {
    @Test
    fun `returns an empty featured list when no posts exist`() {
        mockMvc.perform(get("/api/v1/current-reading-posts/featured"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.featuredBooks.length()", equalTo(0)))
    }

    @Test
    fun `returns up to three featured books with rank and reader count`() {
        createPost("user-1", "User One", "Dune", 5)
        createPost("user-2", "User Two", " dune ", 4)
        createPost("user-3", "User Three", "Hyperion", 5)
        createPost("user-4", "User Four", "Project Hail Mary", 4)
        createPost("user-5", "User Five", "Ancillary Justice", 4)

        mockMvc.perform(get("/api/v1/current-reading-posts/featured"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.featuredBooks.length()", equalTo(3)))
            .andExpect(jsonPath("$.featuredBooks[0].rank", equalTo(1)))
            .andExpect(jsonPath("$.featuredBooks[0].bookTitle", equalTo("Dune")))
            .andExpect(jsonPath("$.featuredBooks[0].readerCount", equalTo(2)))
            .andExpect(jsonPath("$.featuredBooks[1].bookTitle", equalTo("Ancillary Justice")))
            .andExpect(jsonPath("$.featuredBooks[2].bookTitle", equalTo("Hyperion")))
    }

    private fun createPost(userId: String, displayName: String, bookTitle: String, rating: Int) {
        mockMvc.perform(
            post("/api/v1/current-reading-posts")
                .contentType(MediaType.APPLICATION_JSON)
                .headers(TestUsers.headers(userId, displayName).toMockHttpHeaders())
                .content(objectMapper.writeValueAsString(mapOf("bookTitle" to bookTitle, "rating" to rating))),
        ).andExpect(status().isCreated)
    }
}

private fun Map<String, String>.toMockHttpHeaders() = org.springframework.http.HttpHeaders().apply {
    this@toMockHttpHeaders.forEach(::add)
}

