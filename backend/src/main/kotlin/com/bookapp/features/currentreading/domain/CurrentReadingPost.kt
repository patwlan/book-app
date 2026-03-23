package com.bookapp.features.currentreading.domain

import com.bookapp.features.currentreading.application.CurrentReadingFieldError
import com.bookapp.features.currentreading.application.CurrentReadingValidationException
import java.time.Clock
import java.time.Instant
import java.util.UUID

/**
 * Aggregate root for the active current-reading post owned by exactly one user.
 */
data class CurrentReadingPost(
    val postId: UUID,
    val ownerUserId: String,
    val ownerDisplayName: String,
    val bookTitle: String,
    val rating: Rating,
    val postedAt: Instant,
    val updatedAt: Instant,
    val version: Long = 0,
) {
    fun replace(bookTitle: String, ratingValue: Int, ownerDisplayName: String, clock: Clock): CurrentReadingPost {
        val now = Instant.now(clock)
        return copy(
            ownerDisplayName = ownerDisplayName,
            bookTitle = normalizeTitle(bookTitle),
            rating = Rating.of(ratingValue),
            postedAt = now,
            updatedAt = now,
        )
    }

    fun update(bookTitle: String, ratingValue: Int, ownerDisplayName: String, clock: Clock): CurrentReadingPost = copy(
        ownerDisplayName = ownerDisplayName,
        bookTitle = normalizeTitle(bookTitle),
        rating = Rating.of(ratingValue),
        updatedAt = Instant.now(clock),
    )

    companion object {
        fun create(
            ownerUserId: String,
            ownerDisplayName: String,
            bookTitle: String,
            ratingValue: Int,
            clock: Clock,
        ): CurrentReadingPost {
            val now = Instant.now(clock)
            return CurrentReadingPost(
                postId = UUID.randomUUID(),
                ownerUserId = ownerUserId,
                ownerDisplayName = ownerDisplayName,
                bookTitle = normalizeTitle(bookTitle),
                rating = Rating.of(ratingValue),
                postedAt = now,
                updatedAt = now,
            )
        }

        private fun normalizeTitle(rawTitle: String): String {
            val trimmed = rawTitle.trim()
            if (trimmed.isBlank()) {
                throw CurrentReadingValidationException(
                    message = "Book title is required.",
                    fieldErrors = listOf(
                        CurrentReadingFieldError(
                            field = "bookTitle",
                            message = "Book title is required.",
                            code = "required",
                        ),
                    ),
                )
            }
            return trimmed
        }
    }
}

