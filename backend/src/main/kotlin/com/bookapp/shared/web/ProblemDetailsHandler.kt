package com.bookapp.shared.web

import com.bookapp.features.currentreading.application.CurrentReadingAuthorizationException
import com.bookapp.features.currentreading.application.CurrentReadingNotFoundException
import com.bookapp.features.currentreading.application.CurrentReadingValidationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

/**
 * Field-level validation detail returned in problem responses.
 */
data class ProblemFieldError(
    val field: String,
    val message: String,
    val code: String? = null,
)

/**
 * RFC7807-inspired error response returned by the backend API.
 */
data class ProblemResponse(
    val type: String,
    val title: String,
    val status: Int,
    val detail: String,
    val errorCode: String,
    val fieldErrors: List<ProblemFieldError> = emptyList(),
)

/**
 * Maps domain and application exceptions to consistent HTTP problem responses.
 */
@RestControllerAdvice
class ProblemDetailsHandler {
    @ExceptionHandler(CurrentReadingValidationException::class)
    fun handleValidation(exception: CurrentReadingValidationException): ResponseEntity<ProblemResponse> =
        buildResponse(
            status = HttpStatus.BAD_REQUEST,
            title = "Validation failed",
            detail = exception.message ?: "The request is invalid.",
            errorCode = "CURRENT_READING_VALIDATION_FAILED",
            fieldErrors = exception.fieldErrors.map { ProblemFieldError(it.field, it.message, it.code) },
        )

    @ExceptionHandler(CurrentReadingAuthorizationException::class)
    fun handleUnauthorized(exception: CurrentReadingAuthorizationException): ResponseEntity<ProblemResponse> =
        buildResponse(
            status = HttpStatus.UNAUTHORIZED,
            title = "Unauthorized",
            detail = exception.message ?: "Authentication is required.",
            errorCode = "CURRENT_READING_UNAUTHORIZED",
        )

    @ExceptionHandler(CurrentReadingNotFoundException::class)
    fun handleNotFound(exception: CurrentReadingNotFoundException): ResponseEntity<ProblemResponse> =
        buildResponse(
            status = HttpStatus.NOT_FOUND,
            title = "Current reading post not found",
            detail = exception.message ?: "The requested post does not exist.",
            errorCode = "CURRENT_READING_NOT_FOUND",
        )

    @ExceptionHandler(Exception::class)
    fun handleUnexpected(exception: Exception): ResponseEntity<ProblemResponse> =
        buildResponse(
            status = HttpStatus.INTERNAL_SERVER_ERROR,
            title = "Unexpected error",
            detail = exception.message ?: "An unexpected error occurred.",
            errorCode = "UNEXPECTED_ERROR",
        )

    private fun buildResponse(
        status: HttpStatus,
        title: String,
        detail: String,
        errorCode: String,
        fieldErrors: List<ProblemFieldError> = emptyList(),
    ): ResponseEntity<ProblemResponse> = ResponseEntity.status(status).body(
        ProblemResponse(
            type = "about:blank",
            title = title,
            status = status.value(),
            detail = detail,
            errorCode = errorCode,
            fieldErrors = fieldErrors,
        ),
    )
}

