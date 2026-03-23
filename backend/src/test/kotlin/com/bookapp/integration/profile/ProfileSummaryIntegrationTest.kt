package com.bookapp.integration.profile

import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostCommand
import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostUseCase
import com.bookapp.features.currentreading.application.DeleteOwnCurrentReadingPostUseCase
import com.bookapp.features.currentreading.application.UpdateOwnCurrentReadingPostCommand
import com.bookapp.features.currentreading.application.UpdateOwnCurrentReadingPostUseCase
import com.bookapp.features.currentreading.infrastructure.persistence.SpringDataCurrentReadingPostJpaRepository
import com.bookapp.features.currentreading.infrastructure.persistence.SpringDataUserBookReadJpaRepository
import com.bookapp.features.profile.application.ListProfilesUseCase
import com.bookapp.features.profile.application.GetOwnProfileSummaryUseCase
import com.bookapp.features.profile.application.GetProfileSummaryUseCase
import com.bookapp.features.profile.application.ProfileNotFoundException
import com.bookapp.shared.auth.AuthenticatedUser
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProfileSummaryIntegrationTest(
    @Autowired private val createOrReplaceCurrentReadingPostUseCase: CreateOrReplaceCurrentReadingPostUseCase,
    @Autowired private val updateOwnCurrentReadingPostUseCase: UpdateOwnCurrentReadingPostUseCase,
    @Autowired private val deleteOwnCurrentReadingPostUseCase: DeleteOwnCurrentReadingPostUseCase,
    @Autowired private val getOwnProfileSummaryUseCase: GetOwnProfileSummaryUseCase,
    @Autowired private val getProfileSummaryUseCase: GetProfileSummaryUseCase,
    @Autowired private val listProfilesUseCase: ListProfilesUseCase,
    @Autowired private val currentReadingRepository: SpringDataCurrentReadingPostJpaRepository,
    @Autowired private val userBookReadRepository: SpringDataUserBookReadJpaRepository,
) {
    @BeforeEach
    fun clearData() {
        currentReadingRepository.deleteAll()
        userBookReadRepository.deleteAll()
    }

    @Test
    fun `counts distinct books previously recorded by the active user`() {
        val user = AuthenticatedUser("reader-1", "Reader One")

        createOrReplaceCurrentReadingPostUseCase.execute(user, CreateOrReplaceCurrentReadingPostCommand("Dune", 5))
        createOrReplaceCurrentReadingPostUseCase.execute(user, CreateOrReplaceCurrentReadingPostCommand(" Project Hail Mary ", 4))
        updateOwnCurrentReadingPostUseCase.execute(user, UpdateOwnCurrentReadingPostCommand("Hyperion", 5))
        updateOwnCurrentReadingPostUseCase.execute(user, UpdateOwnCurrentReadingPostCommand(" hyperion ", 3))
        deleteOwnCurrentReadingPostUseCase.execute(user)

        val result = getOwnProfileSummaryUseCase.execute(user)

        assertEquals("reader-1", result.userId)
        assertEquals("Reader One", result.displayName)
        assertEquals(3, result.booksReadCount)
    }

    @Test
    fun `returns zero when the active user has never recorded a book`() {
        val result = getOwnProfileSummaryUseCase.execute(AuthenticatedUser("reader-2", "Reader Two"))

        assertEquals(0, result.booksReadCount)
    }

    @Test
    fun `loads another reader profile from persisted history`() {
        val user = AuthenticatedUser("reader-3", "Reader Three")

        createOrReplaceCurrentReadingPostUseCase.execute(user, CreateOrReplaceCurrentReadingPostCommand("Dune", 5))
        createOrReplaceCurrentReadingPostUseCase.execute(user, CreateOrReplaceCurrentReadingPostCommand("Hyperion", 4))

        val result = getProfileSummaryUseCase.execute("reader-3")

        assertEquals("reader-3", result.userId)
        assertEquals("Reader Three", result.displayName)
        assertEquals(2, result.booksReadCount)
    }

    @Test
    fun `throws when a requested foreign profile has never been recorded`() {
        assertThrows(ProfileNotFoundException::class.java) {
            getProfileSummaryUseCase.execute("missing-reader")
        }
    }

    @Test
    fun `lists all known reader profile summaries`() {
        createOrReplaceCurrentReadingPostUseCase.execute(
            AuthenticatedUser("reader-5", "Ada Reader"),
            CreateOrReplaceCurrentReadingPostCommand("Dune", 5),
        )
        createOrReplaceCurrentReadingPostUseCase.execute(
            AuthenticatedUser("reader-6", "Ben Reader"),
            CreateOrReplaceCurrentReadingPostCommand("Hyperion", 4),
        )
        createOrReplaceCurrentReadingPostUseCase.execute(
            AuthenticatedUser("reader-6", "Ben Reader"),
            CreateOrReplaceCurrentReadingPostCommand("Project Hail Mary", 5),
        )

        val result = listProfilesUseCase.execute()

        assertEquals(listOf("Ada Reader", "Ben Reader"), result.map { it.displayName })
        assertEquals(listOf(1, 2), result.map { it.booksReadCount })
    }
}
