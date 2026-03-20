package com.bookapp.features.currentreading.web

import com.bookapp.features.currentreading.application.ListFeaturedCurrentReadsUseCase
import com.bookapp.features.currentreading.application.ListCurrentReadingPostsUseCase
import com.bookapp.shared.auth.AuthenticatedUserProvider
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * REST controller exposing the read-only current-reading feed.
 */
@RestController
@RequestMapping("/api/v1/current-reading-posts")
class CurrentReadingFeedController(
    private val authenticatedUserProvider: AuthenticatedUserProvider,
    private val listCurrentReadingPostsUseCase: ListCurrentReadingPostsUseCase,
    private val listFeaturedCurrentReadsUseCase: ListFeaturedCurrentReadsUseCase,
) {
    @GetMapping
    fun list(): CurrentReadingFeedResponse {
        val currentUserId = authenticatedUserProvider.currentUserOrNull()?.userId
        return CurrentReadingFeedResponse(listCurrentReadingPostsUseCase.execute(currentUserId).map { it.toResponse() })
    }

    @GetMapping("/featured")
    fun listFeaturedBooks(): CurrentReadingFeaturedBooksResponse =
        CurrentReadingFeaturedBooksResponse(listFeaturedCurrentReadsUseCase.execute().map { it.toResponse() })
}

