package com.bookapp.features.currentreading.web

import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostCommand
import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostUseCase
import com.bookapp.features.currentreading.application.CurrentReadingAuthorizationException
import com.bookapp.features.currentreading.application.CurrentReadingValidationException
import com.bookapp.features.currentreading.infrastructure.logging.CurrentReadingLoggingAdapter
import com.bookapp.shared.auth.AuthenticatedUserProvider
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/** REST controller exposing the create-or-replace endpoint for current-reading posts. */
@RestController
@RequestMapping("/api/v1/current-reading-posts")
class CurrentReadingPostController(
    private val authenticatedUserProvider: AuthenticatedUserProvider,
    private val createOrReplaceCurrentReadingPostUseCase: CreateOrReplaceCurrentReadingPostUseCase,
    private val loggingAdapter: CurrentReadingLoggingAdapter,
) {
    @PostMapping
    fun createOrReplace(@RequestBody request: CurrentReadingWriteRequest): ResponseEntity<CurrentReadingPostResponse> {
        val user = authenticatedUserProvider.currentUserOrNull()
            ?: run {
                loggingAdapter.logAuthorizationFailure("missing_identity")
                throw CurrentReadingAuthorizationException()
            }

        return try {
            val result = createOrReplaceCurrentReadingPostUseCase.execute(
                user,
                CreateOrReplaceCurrentReadingPostCommand(request.bookTitle, request.rating),
            )
            loggingAdapter.logCreatedOrReplaced(user.userId, result.post.postId, result.created)
            ResponseEntity.status(if (result.created) HttpStatus.CREATED else HttpStatus.OK).body(result.toResponse())
        } catch (exception: CurrentReadingValidationException) {
            loggingAdapter.logValidationFailure(user.userId, "invalid_request")
            throw exception
        }
    }
}

