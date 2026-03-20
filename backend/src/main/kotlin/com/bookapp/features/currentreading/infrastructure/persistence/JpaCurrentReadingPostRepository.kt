package com.bookapp.features.currentreading.infrastructure.persistence

import com.bookapp.features.currentreading.application.CurrentReadingPostRepository
import com.bookapp.features.currentreading.domain.CurrentReadingPost
import com.bookapp.features.currentreading.domain.Rating
import org.springframework.stereotype.Repository

/**
 * Persistence adapter that maps the current-reading repository port to Spring Data JPA.
 */
@Repository
class JpaCurrentReadingPostRepository(
    private val springDataRepository: SpringDataCurrentReadingPostJpaRepository,
) : CurrentReadingPostRepository {
    override fun findByOwnerUserId(ownerUserId: String): CurrentReadingPost? =
        springDataRepository.findByOwnerUserId(ownerUserId)?.toDomain()

    override fun save(post: CurrentReadingPost): CurrentReadingPost =
        springDataRepository.save(post.toEntity()).toDomain()

    override fun deleteByOwnerUserId(ownerUserId: String): Boolean =
        springDataRepository.deleteByOwnerUserId(ownerUserId) > 0
}

internal fun CurrentReadingPostEntity.toDomain(): CurrentReadingPost = CurrentReadingPost(
    postId = postId,
    ownerUserId = ownerUserId,
    ownerDisplayName = ownerDisplayName,
    bookTitle = bookTitle,
    rating = Rating.of(rating),
    postedAt = postedAt,
    updatedAt = updatedAt,
    version = version,
)

internal fun CurrentReadingPost.toEntity(): CurrentReadingPostEntity = CurrentReadingPostEntity(
    postId = postId,
    ownerUserId = ownerUserId,
    ownerDisplayName = ownerDisplayName,
    bookTitle = bookTitle,
    rating = rating.value,
    postedAt = postedAt,
    updatedAt = updatedAt,
    version = version,
)

