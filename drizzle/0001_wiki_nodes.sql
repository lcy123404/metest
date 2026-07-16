CREATE TABLE IF NOT EXISTS wiki_nodes (
  node_id TEXT PRIMARY KEY,
  parent_id TEXT,
  node_type TEXT NOT NULL CHECK (node_type IN ('section', 'page')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  level TEXT NOT NULL DEFAULT '基础',
  sort_order REAL NOT NULL DEFAULT 0,
  is_custom INTEGER NOT NULL DEFAULT 0,
  is_hidden INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS wiki_nodes_parent_idx
  ON wiki_nodes (parent_id, sort_order);
