package com.bookapp.features.profile.web

import com.bookapp.features.profile.application.ProfileSummaryView

/**
 * API response payload describing the active user's profile summary.
 */
data class ProfileSummaryResponse(
    val userId: String,
    val displayName: String,
    val booksReadCount: Int,
)

/**
 * API response payload for the profiles overview page.
 */
data class ProfilesResponse(
    val items: List<ProfileSummaryResponse>,
)

fun ProfileSummaryView.toResponse(): ProfileSummaryResponse = ProfileSummaryResponse(
    userId = userId,
    displayName = displayName,
    booksReadCount = booksReadCount,
)
