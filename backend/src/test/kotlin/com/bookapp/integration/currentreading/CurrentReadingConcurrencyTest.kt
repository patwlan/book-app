package com.bookapp.integration.currentreading

import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostCommand
import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostUseCase
import com.bookapp.features.currentreading.application.ListCurrentReadingPostsUseCase
import com.bookapp.features.currentreading.application.UpdateOwnCurrentReadingPostCommand
import com.bookapp.features.currentreading.application.UpdateOwnCurrentReadingPostUseCase
import com.bookapp.features.currentreading.infrastructure.persistence.SpringDataCurrentReadingPostJpaRepository
import com.bookapp.shared.auth.AuthenticatedUser
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors

@SpringBootTest
@ActiveProfiles("test")
class CurrentReadingConcurrencyTest(
    @Autowired private val createOrReplaceCurrentReadingPostUseCase: CreateOrReplaceCurrentReadingPostUseCase,
    @Autowired private val updateOwnCurrentReadingPostUseCase: UpdateOwnCurrentReadingPostUseCase,
    @Autowired private val listCurrentReadingPostsUseCase: ListCurrentReadingPostsUseCase,
    @Autowired private val springDataRepository: SpringDataCurrentReadingPostJpaRepository,
) {
    @BeforeEach
    fun clearPosts() {
        springDataRepository.deleteAll()
    }

    @Test
    fun `concurrent updates leave one consistent active post`() {
        val owner = AuthenticatedUser("user-1", "User One")
        createOrReplaceCurrentReadingPostUseCase.execute(owner, CreateOrReplaceCurrentReadingPostCommand("Dune", 5))

        val pool = Executors.newFixedThreadPool(2)
        val latch = CountDownLatch(2)

        listOf(
            UpdateOwnCurrentReadingPostCommand("Hyperion", 4),
            UpdateOwnCurrentReadingPostCommand("Project Hail Mary", 5),
        ).forEach { command ->
            pool.submit {
                try {
                    updateOwnCurrentReadingPostUseCase.execute(owner, command)
                } finally {
                    latch.countDown()
                }
            }
        }

        latch.await()
        pool.shutdown()

        val items = listCurrentReadingPostsUseCase.execute(owner.userId)
        assertEquals(1, items.size)
        assertTrue(items.single().bookTitle in setOf("Hyperion", "Project Hail Mary"))
    }
}

