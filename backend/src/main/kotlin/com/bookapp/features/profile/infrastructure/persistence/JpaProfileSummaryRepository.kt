package com.bookapp.features.profile.infrastructure.persistence

import com.bookapp.features.profile.application.ProfileSummaryRepository
import com.bookapp.features.profile.application.ProfileSummaryView
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Repository

/**
 * Query adapter that reads the active user's distinct recorded-book count from persistence.
 */
@Repository
class JpaProfileSummaryRepository(
    private val entityManager: EntityManager,
) : ProfileSummaryRepository {
    override fun listAll(): List<ProfileSummaryView> = entityManager.createNativeQuery(
        """
        select summary.owner_user_id,
               (
                   select latest.owner_display_name
                   from user_book_reads latest
                   where latest.owner_user_id = summary.owner_user_id
                   order by latest.last_recorded_at desc, latest.normalized_book_title asc
                   limit 1
               ) as owner_display_name,
               summary.books_read_count
        from (
            select owner_user_id, count(*) as books_read_count
            from user_book_reads
            group by owner_user_id
        ) summary
        order by owner_display_name asc, summary.owner_user_id asc
        """.trimIndent(),
    )
        .resultList
        .map { row ->
            row as Array<*>
            ProfileSummaryView(
                userId = row[0] as String,
                displayName = row[1] as String,
                booksReadCount = (row[2] as Number).toInt(),
            )
        }

    override fun findByUserId(userId: String): ProfileSummaryView? {
        val booksReadCount =
            (entityManager.createNativeQuery(
            """
            select count(*)
            from user_book_reads
            where owner_user_id = :userId
            """.trimIndent(),
        )
                .setParameter("userId", userId)
            .singleResult as Number)
            .toInt()

        if (booksReadCount == 0) {
            return null
        }

        val displayName = entityManager.createNativeQuery(
            """
            select owner_display_name
            from user_book_reads
            where owner_user_id = :userId
            order by last_recorded_at desc
            limit 1
            """.trimIndent(),
        )
            .setParameter("userId", userId)
            .singleResult as String

        return ProfileSummaryView(
            userId = userId,
            displayName = displayName,
            booksReadCount = booksReadCount,
        )
    }
}
