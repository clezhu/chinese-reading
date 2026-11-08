-- Content references are scoped to authored revisions; version orders responses
-- within an attempt independently of wall-clock timestamps.
ALTER TABLE lesson_progress ADD COLUMN content_revision INTEGER NOT NULL DEFAULT 1 CHECK (content_revision > 0);
ALTER TABLE lesson_progress ADD COLUMN state_version INTEGER NOT NULL DEFAULT 0 CHECK (state_version >= 0);
ALTER TABLE lesson_progress ADD COLUMN first_completed_content_revision INTEGER;
ALTER TABLE lesson_progress ADD COLUMN last_completed_content_revision INTEGER;
UPDATE lesson_progress SET first_completed_content_revision = 1, last_completed_content_revision = 1
WHERE first_completed_at IS NOT NULL;
