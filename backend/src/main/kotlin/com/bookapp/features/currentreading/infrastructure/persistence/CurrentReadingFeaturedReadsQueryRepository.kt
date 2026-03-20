package com.bookapp.features.currentreading.infrastructure.persistence

import com.bookapp.features.currentreading.application.ActiveCurrentReadingTitleView
import com.bookapp.features.currentreading.application.CurrentReadingFeaturedReadsRepository
import org.springframework.stereotype.Repository

/**
 * Query-side repository that exposes active current-reading titles for featured-book aggregation.
 */
@Repository
class CurrentReadingFeaturedReadsQueryRepository(
    private val springDataRepository: SpringDataCurrentReadingPostJpaRepository,
) : CurrentReadingFeaturedReadsRepository {
    override fun findAllActiveTitles(): List<ActiveCurrentReadingTitleView> =
        springDataRepository.findAllByOrderByPostedAtDesc().map { entity ->
            ActiveCurrentReadingTitleView(bookTitle = entity.bookTitle)
        }
}

