alter table user_book_reads
    add column owner_display_name varchar(255);

alter table user_book_reads
    add column last_recorded_at timestamp with time zone;

update user_book_reads
set owner_display_name = owner_user_id,
    last_recorded_at = first_recorded_at
where owner_display_name is null
   or last_recorded_at is null;

alter table user_book_reads
    alter column owner_display_name set not null;

alter table user_book_reads
    alter column last_recorded_at set not null;

create index idx_user_book_reads_owner_last_recorded_at
    on user_book_reads (owner_user_id, last_recorded_at desc);
