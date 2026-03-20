create index if not exists idx_current_reading_posts_posted_at on current_reading_posts (posted_at desc);
create index if not exists idx_current_reading_posts_owner_lookup on current_reading_posts (owner_user_id);

