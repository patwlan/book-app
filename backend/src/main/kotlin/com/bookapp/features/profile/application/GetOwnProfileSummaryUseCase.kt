package com.bookapp.features.profile.application

import com.bookapp.shared.auth.AuthenticatedUser
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

/**
 * Raised when a profile endpoint is called without an active owner context.
 */
class ProfileAuthorizationException(
    message: String = "An authenticated user is required.",
) : RuntimeException(message)

/**
 * Raised when a requested profile cannot be resolved from persisted profile history.
 */
class ProfileNotFoundException(
    message: String = "Profile not found.",
) : RuntimeException(message)

/**
 * Loads the active user's profile summary, including the distinct books they have recorded.
 */
@Service
class GetOwnProfileSummaryUseCase(
    private val repository: ProfileSummaryRepository,
) {
    @Transactional(readOnly = true)
    fun execute(user: AuthenticatedUser): ProfileSummaryView =
        repository.findByUserId(user.userId)?.copy(displayName = user.displayName)
            ?: ProfileSummaryView(
                userId = user.userId,
                displayName = user.displayName,
                booksReadCount = 0,
            )
}

/**
 * Loads a persisted profile summary for any known reader by user id.
 */
@Service
class GetProfileSummaryUseCase(
    private val repository: ProfileSummaryRepository,
) {
    @Transactional(readOnly = true)
    fun execute(userId: String): ProfileSummaryView = repository.findByUserId(userId) ?: throw ProfileNotFoundException()
}

/**
 * Lists all known reader profile summaries for the profiles overview page.
 */
@Service
class ListProfilesUseCase(
    private val repository: ProfileSummaryRepository,
) {
    @Transactional(readOnly = true)
    fun execute(): List<ProfileSummaryView> = repository.listAll()
}

