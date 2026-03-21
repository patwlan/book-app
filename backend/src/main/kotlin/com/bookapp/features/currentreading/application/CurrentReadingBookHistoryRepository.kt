package com.bookapp.features.currentreading.application

import java.time.Instant

/**
 * Persists the distinct books a user has recorded through current-reading activity.
 */
fun interface CurrentReadingBookHistoryRepository {
    fun record(ownerUserId: String, ownerDisplayName: String, bookTitle: String, recordedAt: Instant)
}

/**
 * No-op fallback used by unit tests that do not exercise read-history persistence.
 */
object NoOpCurrentReadingBookHistoryRepository : CurrentReadingBookHistoryRepository {
    override fun record(ownerUserId: String, ownerDisplayName: String, bookTitle: String, recordedAt: Instant) = Unit
}
