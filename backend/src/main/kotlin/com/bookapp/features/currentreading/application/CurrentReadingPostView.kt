package com.bookapp.features.currentreading.application

import java.time.Instant
import java.util.UUID

data class CurrentReadingPostView(
    val postId: UUID,
    val bookTitle: String,
    val rating: Int,
    val ownerUserId: String,
    val ownerDisplayName: String,
    val postedAt: Instant,
    val updatedAt: Instant,
    val ownedByCurrentUser: Boolean,
)

fun interface CurrentReadingFeedRepository {
    fun findAllActive(currentUserId: String?): List<CurrentReadingPostView>
}

