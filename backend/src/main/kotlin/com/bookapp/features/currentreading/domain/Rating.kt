package com.bookapp.features.currentreading.domain

import com.bookapp.features.currentreading.application.CurrentReadingFieldError
import com.bookapp.features.currentreading.application.CurrentReadingValidationException
import kotlin.ConsistentCopyVisibility

/** Value object representing a whole-number rating on a 1..5 scale. */
@ConsistentCopyVisibility
data class Rating private constructor(val value: Int) {
    companion object {
        fun of(value: Int): Rating {
            if (value !in 1..5) {
                throw CurrentReadingValidationException(
                    message = "Rating must be between 1 and 5.",
                    fieldErrors = listOf(
                        CurrentReadingFieldError(
                            field = "rating",
                            message = "Rating must be between 1 and 5.",
                            code = "out_of_range",
                        ),
                    ),
                )
            }
            return Rating(value)
        }
    }
}

