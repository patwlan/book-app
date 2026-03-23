package com.bookapp.unit.currentreading.application

import com.bookapp.features.currentreading.application.ActiveCurrentReadingTitleView
import com.bookapp.features.currentreading.application.CurrentReadingFeaturedReadsRepository
import com.bookapp.features.currentreading.application.ListFeaturedCurrentReadsUseCase
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class ListFeaturedCurrentReadsUseCaseTest {
    private val repository = InMemoryCurrentReadingFeaturedReadsRepository()
    private val useCase = ListFeaturedCurrentReadsUseCase(repository)

    @Test
    fun `aggregates normalized titles and ranks the top three deterministically`() {
        repository.replaceAll(
            listOf(
                ActiveCurrentReadingTitleView(" dune "),
                ActiveCurrentReadingTitleView("Dune"),
                ActiveCurrentReadingTitleView("hyperion"),
                ActiveCurrentReadingTitleView("Hyperion"),
                ActiveCurrentReadingTitleView("Project Hail Mary"),
            ),
        )

        val result = useCase.execute()

        assertEquals(listOf("Dune", "Hyperion", "Project Hail Mary"), result.map { it.bookTitle })
        assertEquals(listOf(2, 2, 1), result.map { it.readerCount })
        assertEquals(listOf(1, 2, 3), result.map { it.rank })
    }

    @Test
    fun `returns only the available distinct books when fewer than three qualify`() {
        repository.replaceAll(
            listOf(
                ActiveCurrentReadingTitleView("The Left Hand of Darkness"),
                ActiveCurrentReadingTitleView("Ancillary Justice"),
            ),
        )

        val result = useCase.execute()

        assertEquals(2, result.size)
        assertEquals(listOf("Ancillary Justice", "The Left Hand of Darkness"), result.map { it.bookTitle })
    }

    private class InMemoryCurrentReadingFeaturedReadsRepository : CurrentReadingFeaturedReadsRepository {
        private var items: List<ActiveCurrentReadingTitleView> = emptyList()

        override fun findAllActiveTitles(): List<ActiveCurrentReadingTitleView> = items

        fun replaceAll(nextItems: List<ActiveCurrentReadingTitleView>) {
            items = nextItems
        }
    }
}

