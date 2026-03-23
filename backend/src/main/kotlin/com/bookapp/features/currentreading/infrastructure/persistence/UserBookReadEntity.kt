package com.bookapp.features.currentreading.infrastructure.persistence

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.io.Serializable
import java.time.Instant

/**
 * Composite identifier for one distinct book recorded by one user.
 */
@Embeddable
data class UserBookReadId(
    @Column(name = "owner_user_id", nullable = false)
    var ownerUserId: String = "",
    @Column(name = "normalized_book_title", nullable = false)
    var normalizedBookTitle: String = "",
) : Serializable

/**
 * JPA entity storing the distinct books a user has recorded through current-reading activity.
 */
@Entity
@Table(name = "user_book_reads")
class UserBookReadEntity(
    @EmbeddedId
    var id: UserBookReadId,
    @Column(name = "owner_display_name", nullable = false)
    var ownerDisplayName: String,
    @Column(name = "first_recorded_at", nullable = false)
    var firstRecordedAt: Instant,
    @Column(name = "last_recorded_at", nullable = false)
    var lastRecordedAt: Instant,
) {
    constructor() : this(UserBookReadId(), "", Instant.EPOCH, Instant.EPOCH)
}
