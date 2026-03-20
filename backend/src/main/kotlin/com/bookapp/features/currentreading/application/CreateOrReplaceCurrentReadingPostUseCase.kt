package com.bookapp.features.currentreading.application

import com.bookapp.features.currentreading.domain.CurrentReadingPost
import com.bookapp.shared.auth.AuthenticatedUser
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Clock

/** Orchestrates create-or-replace writes for the authenticated user's active post. */
@Service
class CreateOrReplaceCurrentReadingPostUseCase(
    private val repository: CurrentReadingPostRepository,
    private val clock: Clock = Clock.systemUTC(),
) {
    @Transactional
    fun execute(user: AuthenticatedUser, command: CreateOrReplaceCurrentReadingPostCommand): CurrentReadingMutationResult {
        val existing = repository.findByOwnerUserId(user.userId)
        val saved = repository.save(
            existing?.replace(command.bookTitle, command.rating, user.displayName, clock)
                ?: CurrentReadingPost.create(user.userId, user.displayName, command.bookTitle, command.rating, clock),
        )

        return CurrentReadingMutationResult(saved.toView(user.userId), created = existing == null)
    }
}

internal fun com.bookapp.features.currentreading.domain.CurrentReadingPost.toView(currentUserId: String?): CurrentReadingPostView =
    CurrentReadingPostView(
        postId = postId,
        bookTitle = bookTitle,
        rating = rating.value,
        ownerUserId = ownerUserId,
        ownerDisplayName = ownerDisplayName,
        postedAt = postedAt,
        updatedAt = updatedAt,
        ownedByCurrentUser = currentUserId != null && currentUserId == ownerUserId,
    )

