package com.bookapp.features.currentreading.application

/**
 * Lightweight projection of an active current-reading title used for featured-book aggregation.
 */
data class ActiveCurrentReadingTitleView(
    val bookTitle: String,
)

/**
 * Repository port for reading the active titles needed to build the featured-books summary.
 */
fun interface CurrentReadingFeaturedReadsRepository {
    fun findAllActiveTitles(): List<ActiveCurrentReadingTitleView>
}

/**
 * Read model describing one featured book for the main-page hero panel.
 */
data class FeaturedCurrentReadView(
    val rank: Int,
    val bookTitle: String,
    val readerCount: Int,
)

