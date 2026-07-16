CREATE TABLE IF NOT EXISTS wiki_content (
  page_id TEXT PRIMARY KEY,
  draft_summary TEXT NOT NULL DEFAULT '',
  draft_content TEXT NOT NULL DEFAULT '',
  published_summary TEXT,
  published_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT
);

CREATE INDEX IF NOT EXISTS wiki_content_status_idx
  ON wiki_content (status, updated_at DESC);
