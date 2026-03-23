create table if not exists current_reading_posts (
    post_id uuid primary key,
    owner_user_id varchar(120) not null,
    owner_display_name varchar(200) not null,
    book_title varchar(255) not null,
    rating integer not null,
    posted_at timestamp with time zone not null,
    updated_at timestamp with time zone not null,
    version bigint not null default 0,
    constraint uk_current_reading_posts_owner unique (owner_user_id),
    constraint chk_current_reading_posts_rating check (rating between 1 and 5)
);

