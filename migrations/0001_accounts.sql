CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  username TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user_id ON sessions(user_id);
CREATE INDEX sessions_expiry ON sessions(expires_at);

-- Curriculum identities belong to repository content, not duplicated DB rows.
-- No completion operation is exposed in the account/introduction slice.
CREATE TABLE lesson_progress (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('introduction')),
  started_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  first_completed_at INTEGER,
  last_completed_at INTEGER,
  PRIMARY KEY (user_id, lesson_id),
  CHECK ((first_completed_at IS NULL) = (last_completed_at IS NULL)),
  CHECK (last_completed_at IS NULL OR last_completed_at >= first_completed_at)
);
