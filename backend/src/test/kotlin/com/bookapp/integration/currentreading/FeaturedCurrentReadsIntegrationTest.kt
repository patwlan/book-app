package com.bookapp.integration.currentreading

import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostCommand
import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostUseCase
import com.bookapp.features.currentreading.application.ListFeaturedCurrentReadsUseCase
import com.bookapp.features.currentreading.infrastructure.persistence.SpringDataCurrentReadingPostJpaRepository
import com.bookapp.shared.auth.AuthenticatedUser
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FeaturedCurrentReadsIntegrationTest(
    @Autowired private val createOrReplaceCurrentReadingPostUseCase: CreateOrReplaceCurrentReadingPostUseCase,
    @Autowired private val listFeaturedCurrentReadsUseCase: ListFeaturedCurrentReadsUseCase,
    @Autowired private val springDataRepository: SpringDataCurrentReadingPostJpaRepository,
) {
    @BeforeEach
    fun clearPosts() {
        springDataRepository.deleteAll()
    }

    @Test
    fun `returns featured books ranked by active reader count`() {
        createOrReplaceCurrentReadingPostUseCase.execute(AuthenticatedUser("user-1", "User One"), CreateOrReplaceCurrentReadingPostCommand("Dune", 5))
        createOrReplaceCurrentReadingPostUseCase.execute(AuthenticatedUser("user-2", "User Two"), CreateOrReplaceCurrentReadingPostCommand(" dune ", 4))
        createOrReplaceCurrentReadingPostUseCase.execute(AuthenticatedUser("user-3", "User Three"), CreateOrReplaceCurrentReadingPostCommand("Hyperion", 5))
        createOrReplaceCurrentReadingPostUseCase.execute(AuthenticatedUser("user-4", "User Four"), CreateOrReplaceCurrentReadingPostCommand("Project Hail Mary", 5))

        val result = listFeaturedCurrentReadsUseCase.execute()

        assertEquals(listOf("Dune", "Hyperion", "Project Hail Mary"), result.map { it.bookTitle })
        assertEquals(listOf(2, 1, 1), result.map { it.readerCount })
        assertEquals(listOf(1, 2, 3), result.map { it.rank })
    }
}

