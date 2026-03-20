package com.bookapp.integration.currentreading

import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostCommand
import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostUseCase
import com.bookapp.features.currentreading.application.ListCurrentReadingPostsUseCase
import com.bookapp.features.currentreading.infrastructure.persistence.SpringDataCurrentReadingPostJpaRepository
import com.bookapp.shared.auth.AuthenticatedUser
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CurrentReadingFeedRepositoryTest(
    @Autowired private val createOrReplaceCurrentReadingPostUseCase: CreateOrReplaceCurrentReadingPostUseCase,
    @Autowired private val listCurrentReadingPostsUseCase: ListCurrentReadingPostsUseCase,
    @Autowired private val springDataRepository: SpringDataCurrentReadingPostJpaRepository,
) {
    @BeforeEach
    fun clearPosts() {
        springDataRepository.deleteAll()
    }

    @Test
    fun `returns feed items ordered by postedAt descending`() {
        createOrReplaceCurrentReadingPostUseCase.execute(AuthenticatedUser("user-1", "User One"), CreateOrReplaceCurrentReadingPostCommand("Dune", 5))
        createOrReplaceCurrentReadingPostUseCase.execute(AuthenticatedUser("user-2", "User Two"), CreateOrReplaceCurrentReadingPostCommand("Hyperion", 4))

        val items = listCurrentReadingPostsUseCase.execute("user-1")

        assertEquals(listOf("Hyperion", "Dune"), items.map { it.bookTitle })
        assertEquals(true, items.last().ownedByCurrentUser)
    }

    @Test
    fun `returns an empty list when no active posts exist`() {
        val items = listCurrentReadingPostsUseCase.execute("user-1")

        assertEquals(0, items.size)
    }
}

