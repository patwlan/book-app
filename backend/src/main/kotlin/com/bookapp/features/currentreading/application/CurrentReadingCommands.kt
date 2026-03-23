package com.bookapp.features.currentreading.application

data class CreateOrReplaceCurrentReadingPostCommand(
    val bookTitle: String,
    val rating: Int,
)

data class UpdateOwnCurrentReadingPostCommand(
    val bookTitle: String,
    val rating: Int,
)

data class CurrentReadingMutationResult(
    val post: com.bookapp.features.currentreading.application.CurrentReadingPostView,
    val created: Boolean,
)

