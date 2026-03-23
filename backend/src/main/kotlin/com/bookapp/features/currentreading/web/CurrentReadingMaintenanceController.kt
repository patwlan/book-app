package com.bookapp.features.currentreading.web

import com.bookapp.features.currentreading.application.CurrentReadingAuthorizationException
import com.bookapp.features.currentreading.application.CurrentReadingValidationException
import com.bookapp.features.currentreading.application.DeleteOwnCurrentReadingPostUseCase
import com.bookapp.features.currentreading.application.UpdateOwnCurrentReadingPostCommand
import com.bookapp.features.currentreading.application.UpdateOwnCurrentReadingPostUseCase
import com.bookapp.features.currentreading.infrastructure.logging.CurrentReadingLoggingAdapter
import com.bookapp.shared.auth.AuthenticatedUserProvider
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/** REST controller exposing owner-scoped update and delete operations. */
@RestController
@RequestMapping("/api/v1/current-reading-posts/me")
class CurrentReadingMaintenanceController(
    private val authenticatedUserProvider: AuthenticatedUserProvider,
    private val updateOwnCurrentReadingPostUseCase: UpdateOwnCurrentReadingPostUseCase,
    private val deleteOwnCurrentReadingPostUseCase: DeleteOwnCurrentReadingPostUseCase,
    private val loggingAdapter: CurrentReadingLoggingAdapter,
) {
    @PutMapping
    fun update(@RequestBody request: CurrentReadingWriteRequest): CurrentReadingPostResponse {
        val user = authenticatedUserProvider.currentUserOrNull()
            ?: run {
                loggingAdapter.logAuthorizationFailure("missing_identity")
                throw CurrentReadingAuthorizationException()
            }

        return try {
            val updated = updateOwnCurrentReadingPostUseCase.execute(user, UpdateOwnCurrentReadingPostCommand(request.bookTitle, request.rating))
            loggingAdapter.logUpdated(user.userId, updated.postId)
            updated.toResponse()
        } catch (exception: CurrentReadingValidationException) {
            loggingAdapter.logValidationFailure(user.userId, "invalid_request")
            throw exception
        }
    }

    @DeleteMapping
    fun delete(): ResponseEntity<Unit> {
        val user = authenticatedUserProvider.currentUserOrNull()
            ?: run {
                loggingAdapter.logAuthorizationFailure("missing_identity")
                throw CurrentReadingAuthorizationException()
            }

        deleteOwnCurrentReadingPostUseCase.execute(user)
        loggingAdapter.logDeleted(user.userId)
        return ResponseEntity.noContent().build()
    }
}

