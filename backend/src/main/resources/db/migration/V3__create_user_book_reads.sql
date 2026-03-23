create table user_book_reads (
    owner_user_id varchar(255) not null,
    normalized_book_title varchar(512) not null,
    first_recorded_at timestamp with time zone not null,
    primary key (owner_user_id, normalized_book_title)
);

create index idx_user_book_reads_owner_user_id
    on user_book_reads (owner_user_id);
