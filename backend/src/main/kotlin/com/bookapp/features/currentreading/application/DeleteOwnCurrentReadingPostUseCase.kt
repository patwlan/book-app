package com.bookapp.features.currentreading.application

import com.bookapp.shared.auth.AuthenticatedUser
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Deletes the authenticated user's active current-reading post.
 */
@Service
class DeleteOwnCurrentReadingPostUseCase(
    private val repository: CurrentReadingPostRepository,
) {
    @Transactional
    fun execute(user: AuthenticatedUser) {
        if (!repository.deleteByOwnerUserId(user.userId)) {
            throw CurrentReadingNotFoundException()
        }
    }
}

