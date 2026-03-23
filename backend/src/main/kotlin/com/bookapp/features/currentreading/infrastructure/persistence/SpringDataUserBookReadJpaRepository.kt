package com.bookapp.features.currentreading.infrastructure.persistence

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

/**
 * Spring Data repository for the persisted per-user read-history projection.
 */
@Repository
interface SpringDataUserBookReadJpaRepository : JpaRepository<UserBookReadEntity, UserBookReadId>
