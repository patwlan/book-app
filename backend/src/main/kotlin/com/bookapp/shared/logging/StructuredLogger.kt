package com.bookapp.shared.logging

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

/**
 * Minimal structured logging abstraction used by feature adapters.
 */
interface StructuredLogger {
    fun info(event: String, data: Map<String, Any?> = emptyMap())
    fun warn(event: String, data: Map<String, Any?> = emptyMap())
}

/**
 * SLF4J-backed implementation of the shared structured logger contract.
 */
@Component
class Slf4jStructuredLogger : StructuredLogger {
    private val logger = LoggerFactory.getLogger(Slf4jStructuredLogger::class.java)

    override fun info(event: String, data: Map<String, Any?>) {
        logger.info(format(event, data))
    }

    override fun warn(event: String, data: Map<String, Any?>) {
        logger.warn(format(event, data))
    }

    private fun format(event: String, data: Map<String, Any?>): String = buildString {
        append("event=")
        append(event)
        data.forEach { (key, value) ->
            append(' ')
            append(key)
            append('=')
            append(value ?: "null")
        }
    }
}

