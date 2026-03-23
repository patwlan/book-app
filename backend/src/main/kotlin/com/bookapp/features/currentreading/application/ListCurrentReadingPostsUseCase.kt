package com.bookapp.features.currentreading.application

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Loads the active current-reading feed for the caller, optionally flagging owned entries.
 */
@Service
class ListCurrentReadingPostsUseCase(
    private val feedRepository: CurrentReadingFeedRepository,
) {
    @Transactional(readOnly = true)
    fun execute(currentUserId: String?): List<CurrentReadingPostView> = feedRepository.findAllActive(currentUserId)
}

