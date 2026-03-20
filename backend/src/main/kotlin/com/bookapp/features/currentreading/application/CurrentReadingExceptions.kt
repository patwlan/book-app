package com.bookapp.features.currentreading.application

data class CurrentReadingFieldError(
    val field: String,
    val message: String,
    val code: String,
)

class CurrentReadingValidationException(
    message: String,
    val fieldErrors: List<CurrentReadingFieldError>,
) : RuntimeException(message)

class CurrentReadingAuthorizationException(
    message: String = "An authenticated user is required.",
) : RuntimeException(message)

class CurrentReadingNotFoundException(
    message: String = "No active current reading post exists for the current user.",
) : RuntimeException(message)

