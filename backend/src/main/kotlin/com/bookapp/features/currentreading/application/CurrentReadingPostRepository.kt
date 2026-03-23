package com.bookapp.features.currentreading.application

import com.bookapp.features.currentreading.domain.CurrentReadingPost

interface CurrentReadingPostRepository {
    fun findByOwnerUserId(ownerUserId: String): CurrentReadingPost?
    fun save(post: CurrentReadingPost): CurrentReadingPost
    fun deleteByOwnerUserId(ownerUserId: String): Boolean
}

