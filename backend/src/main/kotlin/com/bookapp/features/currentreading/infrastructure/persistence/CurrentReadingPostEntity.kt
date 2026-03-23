package com.bookapp.features.currentreading.infrastructure.persistence

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import jakarta.persistence.Version
import java.time.Instant
import java.util.UUID

/**
 * JPA entity storing the single active current-reading post for one owner.
 */
@Entity
@Table(name = "current_reading_posts")
class CurrentReadingPostEntity(
    @Id
    @Column(name = "post_id", nullable = false)
    var postId: UUID,
    @Column(name = "owner_user_id", nullable = false, unique = true)
    var ownerUserId: String,
    @Column(name = "owner_display_name", nullable = false)
    var ownerDisplayName: String,
    @Column(name = "book_title", nullable = false)
    var bookTitle: String,
    @Column(name = "rating", nullable = false)
    var rating: Int,
    @Column(name = "posted_at", nullable = false)
    var postedAt: Instant,
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant,
    @Version
    @Column(name = "version", nullable = false)
    var version: Long = 0,
) {
    constructor() : this(UUID.randomUUID(), "", "", "", 1, Instant.EPOCH, Instant.EPOCH, 0)
}

