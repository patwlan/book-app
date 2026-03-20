package com.bookapp.support

object TestUsers {
    const val USER_ID_HEADER = "X-User-Id"
    const val USER_NAME_HEADER = "X-User-Name"

    fun headers(userId: String = "user-1", displayName: String = "User One") =
        mapOf(USER_ID_HEADER to userId, USER_NAME_HEADER to displayName)
}

