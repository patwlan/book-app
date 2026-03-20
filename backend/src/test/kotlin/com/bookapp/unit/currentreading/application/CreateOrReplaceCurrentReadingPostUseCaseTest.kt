package com.bookapp.unit.currentreading.application

import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostCommand
import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostUseCase
import com.bookapp.features.currentreading.application.CurrentReadingPostRepository
import com.bookapp.features.currentreading.domain.CurrentReadingPost
import com.bookapp.shared.auth.AuthenticatedUser
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.concurrent.ConcurrentHashMap

class CreateOrReplaceCurrentReadingPostUseCaseTest {
    private val repository = InMemoryCurrentReadingPostRepository()
    private val useCase = CreateOrReplaceCurrentReadingPostUseCase(repository, Clock.fixed(Instant.parse("2026-03-19T10:00:00Z"), ZoneOffset.UTC))

    @Test
    fun `creates a post when the owner has none`() {
        val result = useCase.execute(
            AuthenticatedUser("user-1", "User One"),
            CreateOrReplaceCurrentReadingPostCommand("Dune", 5),
        )

        assertTrue(result.created)
        assertEquals("Dune", result.post.bookTitle)
    }

    @Test
    fun `replaces the active post for the same owner`() {
        val first = useCase.execute(
            AuthenticatedUser("user-1", "User One"),
            CreateOrReplaceCurrentReadingPostCommand("Dune", 5),
        )

        val second = useCase.execute(
            AuthenticatedUser("user-1", "User One"),
            CreateOrReplaceCurrentReadingPostCommand("Hyperion", 4),
        )

        assertFalse(second.created)
        assertEquals(first.post.postId, second.post.postId)
        assertEquals("Hyperion", second.post.bookTitle)
        assertEquals(1, repository.size())
    }

    private class InMemoryCurrentReadingPostRepository : CurrentReadingPostRepository {
        private val posts = ConcurrentHashMap<String, CurrentReadingPost>()

        override fun findByOwnerUserId(ownerUserId: String): CurrentReadingPost? = posts[ownerUserId]

        override fun save(post: CurrentReadingPost): CurrentReadingPost {
            posts[post.ownerUserId] = post
            return post
        }

        override fun deleteByOwnerUserId(ownerUserId: String): Boolean = posts.remove(ownerUserId) != null

        fun size(): Int = posts.size
    }
}

