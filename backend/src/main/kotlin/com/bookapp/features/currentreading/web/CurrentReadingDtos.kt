package com.bookapp.features.currentreading.web

import com.bookapp.features.currentreading.application.CurrentReadingMutationResult
import com.bookapp.features.currentreading.application.CurrentReadingPostView
import com.bookapp.features.currentreading.application.FeaturedCurrentReadView
import java.time.Instant
import java.util.UUID

/**
 * Request payload for creating or updating a current-reading post.
 */
data class CurrentReadingWriteRequest(
    val bookTitle: String,
    val rating: Int,
)

/**
 * API response payload describing a single current-reading post.
 */
data class CurrentReadingPostResponse(
    val postId: UUID,
    val bookTitle: String,
    val rating: Int,
    val ownerUserId: String,
    val ownerDisplayName: String,
    val postedAt: Instant,
    val updatedAt: Instant,
    val ownedByCurrentUser: Boolean,
)

/**
 * API response payload for the current-reading feed.
 */
data class CurrentReadingFeedResponse(
    val items: List<CurrentReadingPostResponse>,
)

/**
 * API response payload describing one featured book for the main-page hero panel.
 */
data class FeaturedCurrentReadResponse(
    val rank: Int,
    val bookTitle: String,
    val readerCount: Int,
)

/**
 * API response payload for the featured-books hero summary.
 */
data class CurrentReadingFeaturedBooksResponse(
    val featuredBooks: List<FeaturedCurrentReadResponse>,
)

fun CurrentReadingPostView.toResponse(): CurrentReadingPostResponse = CurrentReadingPostResponse(
    postId = postId,
    bookTitle = bookTitle,
    rating = rating,
    ownerUserId = ownerUserId,
    ownerDisplayName = ownerDisplayName,
    postedAt = postedAt,
    updatedAt = updatedAt,
    ownedByCurrentUser = ownedByCurrentUser,
)

fun FeaturedCurrentReadView.toResponse(): FeaturedCurrentReadResponse = FeaturedCurrentReadResponse(
    rank = rank,
    bookTitle = bookTitle,
    readerCount = readerCount,
)

fun CurrentReadingMutationResult.toResponse(): CurrentReadingPostResponse = post.toResponse()

