package com.bookapp.unit.currentreading.application

import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostCommand
import com.bookapp.features.currentreading.application.CreateOrReplaceCurrentReadingPostUseCase
import com.bookapp.features.currentreading.application.CurrentReadingNotFoundException
import com.bookapp.features.currentreading.application.CurrentReadingPostRepository
import com.bookapp.features.currentreading.application.UpdateOwnCurrentReadingPostCommand
import com.bookapp.features.currentreading.application.UpdateOwnCurrentReadingPostUseCase
import com.bookapp.features.currentreading.application.DeleteOwnCurrentReadingPostUseCase
import com.bookapp.features.currentreading.domain.CurrentReadingPost
import com.bookapp.shared.auth.AuthenticatedUser
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import java.time.Clock
import java.time.Instant
import java.time.ZoneOffset
import java.util.concurrent.ConcurrentHashMap

class UpdateDeleteOwnCurrentReadingPostUseCaseTest {
    private val repository = InMemoryCurrentReadingPostRepository()
    private val clock = Clock.fixed(Instant.parse("2026-03-19T10:00:00Z"), ZoneOffset.UTC)
    private val createOrReplace = CreateOrReplaceCurrentReadingPostUseCase(repository, clock)
    private val update = UpdateOwnCurrentReadingPostUseCase(repository, clock)
    private val delete = DeleteOwnCurrentReadingPostUseCase(repository)

    @Test
    fun `updates only the owner's active post`() {
        createOrReplace.execute(AuthenticatedUser("user-1", "User One"), CreateOrReplaceCurrentReadingPostCommand("Dune", 5))

        val updated = update.execute(
            AuthenticatedUser("user-1", "User One"),
            UpdateOwnCurrentReadingPostCommand("Project Hail Mary", 4),
        )

        assertEquals("Project Hail Mary", updated.bookTitle)
    }

    @Test
    fun `throws when the owner has no active post`() {
        assertThrows(CurrentReadingNotFoundException::class.java) {
            update.execute(AuthenticatedUser("user-2", "User Two"), UpdateOwnCurrentReadingPostCommand("Missing", 3))
        }
    }

    @Test
    fun `deletes the owner's post`() {
        createOrReplace.execute(AuthenticatedUser("user-1", "User One"), CreateOrReplaceCurrentReadingPostCommand("Dune", 5))

        delete.execute(AuthenticatedUser("user-1", "User One"))

        assertThrows(CurrentReadingNotFoundException::class.java) {
            update.execute(AuthenticatedUser("user-1", "User One"), UpdateOwnCurrentReadingPostCommand("Dune", 4))
        }
    }

    private class InMemoryCurrentReadingPostRepository : CurrentReadingPostRepository {
        private val posts = ConcurrentHashMap<String, CurrentReadingPost>()

        override fun findByOwnerUserId(ownerUserId: String): CurrentReadingPost? = posts[ownerUserId]

        override fun save(post: CurrentReadingPost): CurrentReadingPost {
            posts[post.ownerUserId] = post
            return post
        }

        override fun deleteByOwnerUserId(ownerUserId: String): Boolean = posts.remove(ownerUserId) != null
    }
}

