package com.bookapp.features.currentreading.application

import com.bookapp.shared.auth.AuthenticatedUser
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Clock

/**
 * Updates the authenticated user's active current-reading post in place.
 */
@Service
class UpdateOwnCurrentReadingPostUseCase(
    private val repository: CurrentReadingPostRepository,
    private val clock: Clock = Clock.systemUTC(),
) {
    @Transactional
    fun execute(user: AuthenticatedUser, command: UpdateOwnCurrentReadingPostCommand): CurrentReadingPostView {
        val existing = repository.findByOwnerUserId(user.userId)
            ?: throw CurrentReadingNotFoundException()

        val saved = repository.save(existing.update(command.bookTitle, command.rating, user.displayName, clock))
        return saved.toView(user.userId)
    }
}

