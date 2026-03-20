package com.bookapp.features.currentreading.infrastructure.persistence

import com.bookapp.features.currentreading.application.CurrentReadingFeedRepository
import com.bookapp.features.currentreading.application.CurrentReadingPostView
import org.springframework.stereotype.Repository

/**
 * Query-side repository that projects persisted posts into feed views.
 */
@Repository
class CurrentReadingFeedQueryRepository(
    private val springDataRepository: SpringDataCurrentReadingPostJpaRepository,
) : CurrentReadingFeedRepository {
    override fun findAllActive(currentUserId: String?): List<CurrentReadingPostView> =
        springDataRepository.findAllByOrderByPostedAtDesc().map { entity ->
            CurrentReadingPostView(
                postId = entity.postId,
                bookTitle = entity.bookTitle,
                rating = entity.rating,
                ownerUserId = entity.ownerUserId,
                ownerDisplayName = entity.ownerDisplayName,
                postedAt = entity.postedAt,
                updatedAt = entity.updatedAt,
                ownedByCurrentUser = currentUserId != null && currentUserId == entity.ownerUserId,
            )
        }
}

