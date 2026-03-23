package com.bookapp.unit.currentreading.domain

import com.bookapp.features.currentreading.application.CurrentReadingValidationException
import com.bookapp.features.currentreading.domain.CurrentReadingPost
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset

class CurrentReadingPostTest {
    private val clock = Clock.fixed(Instant.parse("2026-03-19T10:00:00Z"), ZoneOffset.UTC)

    @Test
    fun `trims the title when creating a post`() {
        val post = CurrentReadingPost.create(
            ownerUserId = "user-1",
            ownerDisplayName = "User One",
            bookTitle = "  Dune  ",
            ratingValue = 5,
            clock = clock,
        )

        assertEquals("Dune", post.bookTitle)
        assertEquals(5, post.rating.value)
    }

    @Test
    fun `rejects blank titles`() {
        assertThrows(CurrentReadingValidationException::class.java) {
            CurrentReadingPost.create(
                ownerUserId = "user-1",
                ownerDisplayName = "User One",
                bookTitle = "   ",
                ratingValue = 4,
                clock = clock,
            )
        }
    }

    @Test
    fun `rejects ratings outside the supported range`() {
        assertThrows(CurrentReadingValidationException::class.java) {
            CurrentReadingPost.create(
                ownerUserId = "user-1",
                ownerDisplayName = "User One",
                bookTitle = "Dune",
                ratingValue = 6,
                clock = clock,
            )
        }
    }
}

