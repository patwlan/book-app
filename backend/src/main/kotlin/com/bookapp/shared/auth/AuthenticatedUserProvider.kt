package com.bookapp.shared.auth

import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Component

/**
 * Immutable owner context resolved from the incoming request.
 */
data class AuthenticatedUser(
    val userId: String,
    val displayName: String,
)

/**
 * Provides access to the current authenticated user for the active request scope.
 */
fun interface AuthenticatedUserProvider {
    fun currentUserOrNull(): AuthenticatedUser?
}

/**
 * Header names used by the minimal owner-context implementation.
 */
object AuthHeaders {
    const val USER_ID = "X-User-Id"
    const val USER_NAME = "X-User-Name"
}

@Component
/**
 * Resolves the current user from request headers until a full authentication mechanism exists.
 */
class RequestHeaderAuthenticatedUserProvider(
    private val request: HttpServletRequest,
) : AuthenticatedUserProvider {
    override fun currentUserOrNull(): AuthenticatedUser? {
        val userId = request.getHeader(AuthHeaders.USER_ID)?.trim().orEmpty()
        val displayName = request.getHeader(AuthHeaders.USER_NAME)?.trim().orEmpty()

        if (userId.isBlank() || displayName.isBlank()) {
            return null
        }

        return AuthenticatedUser(userId = userId, displayName = displayName)
    }
}

