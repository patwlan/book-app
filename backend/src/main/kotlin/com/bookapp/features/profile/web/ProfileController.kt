package com.bookapp.features.profile.web

import com.bookapp.features.profile.application.GetOwnProfileSummaryUseCase
import com.bookapp.features.profile.application.GetProfileSummaryUseCase
import com.bookapp.features.profile.application.ListProfilesUseCase
import com.bookapp.features.profile.application.ProfileAuthorizationException
import com.bookapp.shared.auth.AuthenticatedUserProvider
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * REST controller exposing read-only profile summaries for the profiles overview and reader detail pages.
 */
@RestController
@RequestMapping("/api/v1")
class ProfileController(
    private val authenticatedUserProvider: AuthenticatedUserProvider,
    private val getOwnProfileSummaryUseCase: GetOwnProfileSummaryUseCase,
    private val getProfileSummaryUseCase: GetProfileSummaryUseCase,
    private val listProfilesUseCase: ListProfilesUseCase,
) {
    @GetMapping("/profile/me")
    fun getOwnProfile(): ProfileSummaryResponse {
        val user = authenticatedUserProvider.currentUserOrNull() ?: throw ProfileAuthorizationException()
        return getOwnProfileSummaryUseCase.execute(user).toResponse()
    }

    @GetMapping("/profiles")
    fun listProfiles(): ProfilesResponse = ProfilesResponse(listProfilesUseCase.execute().map { it.toResponse() })

    @GetMapping("/profiles/{userId}")
    fun getProfile(@PathVariable userId: String): ProfileSummaryResponse = getProfileSummaryUseCase.execute(userId).toResponse()

    @GetMapping("/profile/{userId}")
    fun getLegacyProfile(@PathVariable userId: String): ProfileSummaryResponse = getProfile(userId)
}
