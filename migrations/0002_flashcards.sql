-- Retain existing introductions and milestones while broadening attempt phases.
CREATE TABLE lesson_progress_next (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('introduction', 'flashcards', 'story', 'revision-flashcards', 'complete')),
  attempt_id TEXT NOT NULL,
  revealed_occurrence_ids TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(revealed_occurrence_ids) AND json_type(revealed_occurrence_ids) = 'array'),
  started_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  first_completed_at INTEGER,
  last_completed_at INTEGER,
  PRIMARY KEY (user_id, lesson_id),
  CHECK ((first_completed_at IS NULL) = (last_completed_at IS NULL)),
  CHECK (last_completed_at IS NULL OR last_completed_at >= first_completed_at)
);
INSERT INTO lesson_progress_next
  (user_id, lesson_id, phase, attempt_id, started_at, updated_at, first_completed_at, last_completed_at)
SELECT user_id, lesson_id, phase, lower(hex(randomblob(16))), started_at, updated_at, first_completed_at, last_completed_at
FROM lesson_progress;
DROP TABLE lesson_progress;
ALTER TABLE lesson_progress_next RENAME TO lesson_progress;
