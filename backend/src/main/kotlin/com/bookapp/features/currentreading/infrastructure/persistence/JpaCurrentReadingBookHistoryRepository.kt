package com.bookapp.features.currentreading.infrastructure.persistence

import com.bookapp.features.currentreading.application.CurrentReadingBookHistoryRepository
import org.springframework.stereotype.Repository
import java.time.Instant
import java.util.Locale

/**
 * Persistence adapter that stores one distinct normalized book title per user.
 */
@Repository
class JpaCurrentReadingBookHistoryRepository(
    private val springDataRepository: SpringDataUserBookReadJpaRepository,
) : CurrentReadingBookHistoryRepository {
    override fun record(ownerUserId: String, ownerDisplayName: String, bookTitle: String, recordedAt: Instant) {
        val normalizedTitle = normalizeTitle(bookTitle)
        val entityId = UserBookReadId(ownerUserId = ownerUserId, normalizedBookTitle = normalizedTitle)
        val existing = springDataRepository.findById(entityId).orElse(null)

        if (existing != null) {
            existing.ownerDisplayName = ownerDisplayName
            existing.lastRecordedAt = recordedAt
            springDataRepository.save(existing)
            return
        }

        springDataRepository.save(
            UserBookReadEntity(
                id = entityId,
                ownerDisplayName = ownerDisplayName,
                firstRecordedAt = recordedAt,
                lastRecordedAt = recordedAt,
            ),
        )
    }

    private fun normalizeTitle(bookTitle: String): String = bookTitle.trim().lowercase(Locale.ROOT)
}
