package com.bookapp.unit.profile.application

import com.bookapp.features.profile.application.GetOwnProfileSummaryUseCase
import com.bookapp.features.profile.application.GetProfileSummaryUseCase
import com.bookapp.features.profile.application.ProfileNotFoundException
import com.bookapp.features.profile.application.ProfileSummaryRepository
import com.bookapp.features.profile.application.ProfileSummaryView
import com.bookapp.shared.auth.AuthenticatedUser
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test

class GetOwnProfileSummaryUseCaseTest {
    private val repository = InMemoryProfileSummaryRepository()
    private val getOwnProfileSummaryUseCase = GetOwnProfileSummaryUseCase(repository)
    private val getProfileSummaryUseCase = GetProfileSummaryUseCase(repository)

    @Test
    fun `returns the active user identity with the persisted books-read count`() {
        repository.replaceSummary(
            ProfileSummaryView(userId = "reader-7", displayName = "Stored Reader Seven", booksReadCount = 12),
        )

        val result = getOwnProfileSummaryUseCase.execute(AuthenticatedUser("reader-7", "Reader Seven"))

        assertEquals("reader-7", result.userId)
        assertEquals("Reader Seven", result.displayName)
        assertEquals(12, result.booksReadCount)
    }

    @Test
    fun `returns zero when the user has no persisted reading summary`() {
        val result = getOwnProfileSummaryUseCase.execute(AuthenticatedUser("reader-8", "Reader Eight"))

        assertEquals("reader-8", result.userId)
        assertEquals("Reader Eight", result.displayName)
        assertEquals(0, result.booksReadCount)
    }

    @Test
    fun `returns a foreign profile when it exists`() {
        repository.replaceSummary(
            ProfileSummaryView(userId = "reader-9", displayName = "Reader Nine", booksReadCount = 4),
        )

        val result = getProfileSummaryUseCase.execute("reader-9")

        assertEquals("reader-9", result.userId)
        assertEquals("Reader Nine", result.displayName)
        assertEquals(4, result.booksReadCount)
    }

    @Test
    fun `throws when a foreign profile does not exist`() {
        assertThrows(ProfileNotFoundException::class.java) {
            getProfileSummaryUseCase.execute("missing-reader")
        }
    }

    private class InMemoryProfileSummaryRepository : ProfileSummaryRepository {
        private val summaries = mutableMapOf<String, ProfileSummaryView>()

        override fun listAll(): List<ProfileSummaryView> = summaries.values.toList()

        override fun findByUserId(userId: String): ProfileSummaryView? = summaries[userId]

        fun replaceSummary(summary: ProfileSummaryView) {
            summaries[summary.userId] = summary
        }
    }
}
