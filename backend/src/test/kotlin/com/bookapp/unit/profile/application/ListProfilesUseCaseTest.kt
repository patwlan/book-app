package com.bookapp.unit.profile.application

import com.bookapp.features.profile.application.ListProfilesUseCase
import com.bookapp.features.profile.application.ProfileSummaryRepository
import com.bookapp.features.profile.application.ProfileSummaryView
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class ListProfilesUseCaseTest {
    private val repository = InMemoryProfileSummaryRepository()
    private val useCase = ListProfilesUseCase(repository)

    @Test
    fun `returns all reader summaries in repository order`() {
        repository.replaceAll(
            listOf(
                ProfileSummaryView(userId = "reader-2", displayName = "Ada Reader", booksReadCount = 5),
                ProfileSummaryView(userId = "reader-1", displayName = "Ben Reader", booksReadCount = 2),
            ),
        )

        val result = useCase.execute()

        assertEquals(listOf("Ada Reader", "Ben Reader"), result.map { it.displayName })
        assertEquals(listOf(5, 2), result.map { it.booksReadCount })
    }

    @Test
    fun `returns an empty list when no summaries exist`() {
        assertEquals(emptyList<ProfileSummaryView>(), useCase.execute())
    }

    private class InMemoryProfileSummaryRepository : ProfileSummaryRepository {
        private var items: List<ProfileSummaryView> = emptyList()

        override fun listAll(): List<ProfileSummaryView> = items

        override fun findByUserId(userId: String): ProfileSummaryView? = items.find { it.userId == userId }

        fun replaceAll(nextItems: List<ProfileSummaryView>) {
            items = nextItems
        }
    }
}
