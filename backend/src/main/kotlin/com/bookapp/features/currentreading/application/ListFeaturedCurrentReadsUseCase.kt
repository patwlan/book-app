package com.bookapp.features.currentreading.application

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Aggregates active current-reading posts into the ranked featured-books summary for the main page.
 */
@Service
class ListFeaturedCurrentReadsUseCase(
    private val featuredReadsRepository: CurrentReadingFeaturedReadsRepository,
) {
    @Transactional(readOnly = true)
    fun execute(limit: Int = 3): List<FeaturedCurrentReadView> =
        featuredReadsRepository.findAllActiveTitles()
            .groupBy { normalizeTitle(it.bookTitle) }
            .map { (normalizedTitle, titles) ->
                FeaturedCurrentReadCandidate(
                    normalizedTitle = normalizedTitle,
                    displayTitle = titles.map { it.bookTitle.trim() }.minWithOrNull(compareBy(String::lowercase, { it }))!!,
                    readerCount = titles.size,
                )
            }
            .sortedWith(
                compareByDescending<FeaturedCurrentReadCandidate> { it.readerCount }
                    .thenBy { it.normalizedTitle }
                    .thenBy { it.displayTitle },
            )
            .take(limit)
            .mapIndexed { index, candidate ->
                FeaturedCurrentReadView(
                    rank = index + 1,
                    bookTitle = candidate.displayTitle,
                    readerCount = candidate.readerCount,
                )
            }

    private fun normalizeTitle(rawTitle: String): String = rawTitle.trim().lowercase()
}

private data class FeaturedCurrentReadCandidate(
    val normalizedTitle: String,
    val displayTitle: String,
    val readerCount: Int,
)

