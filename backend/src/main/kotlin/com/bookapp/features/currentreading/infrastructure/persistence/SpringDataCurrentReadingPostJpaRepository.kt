package com.bookapp.features.currentreading.infrastructure.persistence

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface SpringDataCurrentReadingPostJpaRepository : JpaRepository<CurrentReadingPostEntity, UUID> {
    fun findByOwnerUserId(ownerUserId: String): CurrentReadingPostEntity?
    fun deleteByOwnerUserId(ownerUserId: String): Long
    fun findAllByOrderByPostedAtDesc(): List<CurrentReadingPostEntity>
}

