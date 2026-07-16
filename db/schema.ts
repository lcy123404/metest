export const wikiContentTableSql = `CREATE TABLE IF NOT EXISTS wiki_content (
  page_id TEXT PRIMARY KEY,
  draft_summary TEXT NOT NULL DEFAULT '',
  draft_content TEXT NOT NULL DEFAULT '',
  published_summary TEXT,
  published_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT
)`;

export const wikiContentStatusIndexSql = `CREATE INDEX IF NOT EXISTS wiki_content_status_idx
  ON wiki_content (status, updated_at DESC)`;

export const wikiNodesTableSql = `CREATE TABLE IF NOT EXISTS wiki_nodes (
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
)`;

export const wikiNodesParentIndexSql = `CREATE INDEX IF NOT EXISTS wiki_nodes_parent_idx
  ON wiki_nodes (parent_id, sort_order)`;
