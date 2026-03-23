package com.bookapp.features.profile.application

/**
 * Read model returned for the active user's profile summary.
 */
data class ProfileSummaryView(
    val userId: String,
    val displayName: String,
    val booksReadCount: Int,
)

/**
 * Query-side repository port used to resolve profile summaries for readers.
 */
interface ProfileSummaryRepository {
    fun listAll(): List<ProfileSummaryView>

    fun findByUserId(userId: String): ProfileSummaryView?
}
