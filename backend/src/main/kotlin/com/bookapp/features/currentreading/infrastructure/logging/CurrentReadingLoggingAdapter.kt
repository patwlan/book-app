package com.bookapp.features.currentreading.infrastructure.logging

import com.bookapp.shared.logging.StructuredLogger
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * Feature-local logging adapter that emits structured events for current-reading operations.
 */
@Component
class CurrentReadingLoggingAdapter(
    private val logger: StructuredLogger,
) {
    fun logCreatedOrReplaced(ownerUserId: String, postId: UUID, created: Boolean) {
        logger.info(
            event = "current_reading.created_or_replaced",
            data = mapOf(
                "feature" to "current-reading",
                "ownerUserId" to ownerUserId,
                "postId" to postId,
                "created" to created,
            ),
        )
    }

    fun logUpdated(ownerUserId: String, postId: UUID) {
        logger.info(
            event = "current_reading.updated",
            data = mapOf(
                "feature" to "current-reading",
                "ownerUserId" to ownerUserId,
                "postId" to postId,
            ),
        )
    }

    fun logDeleted(ownerUserId: String) {
        logger.info(
            event = "current_reading.deleted",
            data = mapOf(
                "feature" to "current-reading",
                "ownerUserId" to ownerUserId,
            ),
        )
    }

    fun logValidationFailure(ownerUserId: String?, reasonCode: String) {
        logger.warn(
            event = "current_reading.validation_failed",
            data = mapOf(
                "feature" to "current-reading",
                "ownerUserId" to ownerUserId,
                "reasonCode" to reasonCode,
            ),
        )
    }

    fun logAuthorizationFailure(reasonCode: String) {
        logger.warn(
            event = "current_reading.authorization_failed",
            data = mapOf(
                "feature" to "current-reading",
                "reasonCode" to reasonCode,
            ),
        )
    }
}

