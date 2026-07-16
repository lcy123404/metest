const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

const tableSql = `CREATE TABLE IF NOT EXISTS wiki_content (
  page_id TEXT PRIMARY KEY,
  draft_summary TEXT NOT NULL DEFAULT '',
  draft_content TEXT NOT NULL DEFAULT '',
  published_summary TEXT,
  published_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TEXT
)`;

const indexSql = `CREATE INDEX IF NOT EXISTS wiki_content_status_idx
  ON wiki_content (status, updated_at DESC)`;

const nodeTableSql = `CREATE TABLE IF NOT EXISTS wiki_nodes (
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

const nodeIndexSql = `CREATE INDEX IF NOT EXISTS wiki_nodes_parent_idx
  ON wiki_nodes (parent_id, sort_order)`;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

async function ensureSchema(db) {
  await db.batch([
    db.prepare(tableSql),
    db.prepare(indexSql),
    db.prepare(nodeTableSql),
    db.prepare(nodeIndexSql),
  ]);
}

async function handleWikiApi(request, env, url) {
  if (!env.DB) return json({ error: '知识库数据库尚未绑定。' }, 503);
  await ensureSchema(env.DB);

  if (url.pathname === '/api/wiki-content' && request.method === 'GET') {
    const result = await env.DB.prepare(`SELECT page_id, published_summary AS summary,
      published_content AS content, updated_at, published_at
      FROM wiki_content WHERE published_content IS NOT NULL ORDER BY page_id`).all();
    return json({ items: result.results || [] });
  }

  if (url.pathname === '/api/admin/wiki-content' && request.method === 'GET') {
    const result = await env.DB.prepare(`SELECT page_id, draft_summary AS summary,
      draft_content AS content, status, updated_at, published_at
      FROM wiki_content ORDER BY updated_at DESC`).all();
    return json({ items: result.results || [] });
  }

  if ((url.pathname === '/api/wiki-structure' || url.pathname === '/api/admin/wiki-nodes') && request.method === 'GET') {
    const result = await env.DB.prepare(`SELECT node_id, parent_id, node_type, title, description,
      summary, level, sort_order, is_custom, is_hidden, updated_at
      FROM wiki_nodes ORDER BY sort_order, updated_at`).all();
    return json({ items: result.results || [] });
  }

  if (url.pathname === '/api/admin/wiki-nodes' && request.method === 'POST') {
    const body = await request.json().catch(() => null);
    const nodeType = body?.node_type === 'section' ? 'section' : 'page';
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const parentId = nodeType === 'section' ? null : String(body?.parent_id || '');
    if (!title || title.length > 120) return json({ error: '标题不能为空且不能超过 120 字符。' }, 400);
    if (nodeType === 'page' && !parentId) return json({ error: '知识页必须选择上级节点。' }, 400);

    const nodeId = `custom-${crypto.randomUUID()}`;
    await env.DB.prepare(`INSERT INTO wiki_nodes
      (node_id, parent_id, node_type, title, description, summary, level, sort_order, is_custom, is_hidden, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, CURRENT_TIMESTAMP)`)
      .bind(
        nodeId,
        parentId,
        nodeType,
        title,
        String(body?.description || '').trim().slice(0, 500),
        String(body?.summary || '').trim().slice(0, 500),
        String(body?.level || '基础').trim().slice(0, 30),
        Number.isFinite(Number(body?.sort_order)) ? Number(body.sort_order) : Date.now(),
      )
      .run();
    const created = await env.DB.prepare('SELECT * FROM wiki_nodes WHERE node_id = ?').bind(nodeId).first();
    return json({ item: created }, 201);
  }

  if (url.pathname === '/api/admin/wiki-import' && request.method === 'POST') {
    const body = await request.json().catch(() => null);
    const modules = Array.isArray(body?.modules) ? body.modules : [];
    const status = body?.status === 'published' ? 'published' : 'draft';
    const nodeCount = modules.reduce((total, module) => total + 1 + (module.pages || []).reduce(
      (pageTotal, page) => pageTotal + 1 + (page.children || []).length,
      0,
    ), 0);
    if (!modules.length) return json({ error: '没有可导入的目录。' }, 400);
    if (modules.length > 50 || nodeCount > 300) return json({ error: '单次最多导入 50 个模块或 300 个目录节点。' }, 413);
    if (JSON.stringify(body).length > 1200000) return json({ error: 'Markdown 内容过大，请拆分后导入。' }, 413);

    const statements = [];
    const createdIds = [];
    const baseOrder = Date.now();
    const addPage = (page, parentId, sortOrder) => {
      const pageId = `custom-${crypto.randomUUID()}`;
      const title = String(page?.title || '').trim().slice(0, 120);
      if (!title) throw new Error('导入内容中存在空白页面标题。');
      const summary = String(page?.summary || '').trim().slice(0, 500);
      const content = String(page?.content || '').trim().slice(0, 300000);
      statements.push(env.DB.prepare(`INSERT INTO wiki_nodes
        (node_id, parent_id, node_type, title, description, summary, level, sort_order, is_custom, is_hidden, updated_at)
        VALUES (?, ?, 'page', ?, '', ?, ?, ?, 1, 0, CURRENT_TIMESTAMP)`)
        .bind(pageId, parentId, title, summary, String(page?.level || '基础').slice(0, 30), sortOrder));
      createdIds.push(pageId);

      if (content) {
        if (status === 'published') {
          statements.push(env.DB.prepare(`INSERT INTO wiki_content
            (page_id, draft_summary, draft_content, published_summary, published_content, status, updated_at, published_at)
            VALUES (?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
            .bind(pageId, summary, content, summary, content));
        } else {
          statements.push(env.DB.prepare(`INSERT INTO wiki_content
            (page_id, draft_summary, draft_content, status, updated_at)
            VALUES (?, ?, ?, 'draft', CURRENT_TIMESTAMP)`)
            .bind(pageId, summary, content));
        }
      }

      (page.children || []).forEach((child, childIndex) => addPage(child, pageId, childIndex * 1000));
    };

    modules.forEach((module, moduleIndex) => {
      const moduleId = `custom-${crypto.randomUUID()}`;
      const title = String(module?.title || '').trim().slice(0, 120);
      if (!title) throw new Error('导入内容中存在空白模块标题。');
      statements.push(env.DB.prepare(`INSERT INTO wiki_nodes
        (node_id, parent_id, node_type, title, description, summary, level, sort_order, is_custom, is_hidden, updated_at)
        VALUES (?, NULL, 'section', ?, ?, '', '基础', ?, 1, 0, CURRENT_TIMESTAMP)`)
        .bind(moduleId, title, String(module?.description || '').trim().slice(0, 500), baseOrder + moduleIndex * 1000));
      createdIds.push(moduleId);
      (module.pages || []).forEach((page, pageIndex) => addPage(page, moduleId, pageIndex * 1000));
    });

    for (let index = 0; index < statements.length; index += 50) {
      await env.DB.batch(statements.slice(index, index + 50));
    }
    return json({ ok: true, created: createdIds, nodes: nodeCount, status }, 201);
  }

  const nodeMatch = url.pathname.match(/^\/api\/admin\/wiki-nodes\/([^/]+)$/);
  if (nodeMatch) {
    const nodeId = decodeURIComponent(nodeMatch[1]);
    if (!/^[a-z0-9-]{2,100}$/.test(nodeId)) return json({ error: '节点 ID 不合法。' }, 400);

    if (request.method === 'PUT') {
      const body = await request.json().catch(() => null);
      const nodeType = body?.node_type === 'section' ? 'section' : 'page';
      const title = typeof body?.title === 'string' ? body.title.trim() : '';
      const parentId = nodeType === 'section' ? null : String(body?.parent_id || '');
      if (!title || title.length > 120) return json({ error: '标题不能为空且不能超过 120 字符。' }, 400);
      if (nodeType === 'page' && !parentId) return json({ error: '知识页必须选择上级节点。' }, 400);

      await env.DB.prepare(`INSERT INTO wiki_nodes
        (node_id, parent_id, node_type, title, description, summary, level, sort_order, is_custom, is_hidden, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(node_id) DO UPDATE SET
          parent_id = excluded.parent_id,
          node_type = excluded.node_type,
          title = excluded.title,
          description = excluded.description,
          summary = excluded.summary,
          level = excluded.level,
          sort_order = excluded.sort_order,
          is_custom = excluded.is_custom,
          is_hidden = excluded.is_hidden,
          updated_at = CURRENT_TIMESTAMP`)
        .bind(
          nodeId,
          parentId,
          nodeType,
          title,
          String(body?.description || '').trim().slice(0, 500),
          String(body?.summary || '').trim().slice(0, 500),
          String(body?.level || '基础').trim().slice(0, 30),
          Number.isFinite(Number(body?.sort_order)) ? Number(body.sort_order) : 0,
          body?.is_custom ? 1 : 0,
          body?.is_hidden ? 1 : 0,
        )
        .run();
      const saved = await env.DB.prepare('SELECT * FROM wiki_nodes WHERE node_id = ?').bind(nodeId).first();
      return json({ item: saved });
    }

    if (request.method === 'DELETE') {
      const node = await env.DB.prepare('SELECT node_id, is_custom FROM wiki_nodes WHERE node_id = ?').bind(nodeId).first();
      if (!node?.is_custom) return json({ error: '内置节点请使用隐藏功能。' }, 400);
      const allNodes = await env.DB.prepare('SELECT node_id, parent_id FROM wiki_nodes').all();
      const descendants = new Set([nodeId]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const item of allNodes.results || []) {
          if (descendants.has(item.parent_id) && !descendants.has(item.node_id)) {
            descendants.add(item.node_id);
            changed = true;
          }
        }
      }
      const ids = [...descendants];
      const placeholders = ids.map(() => '?').join(', ');
      await env.DB.batch([
        env.DB.prepare(`DELETE FROM wiki_content WHERE page_id IN (${placeholders})`).bind(...ids),
        env.DB.prepare(`DELETE FROM wiki_nodes WHERE node_id IN (${placeholders})`).bind(...ids),
      ]);
      return json({ ok: true, deleted: ids });
    }

    return json({ error: '不支持的请求方法。' }, 405);
  }

  const match = url.pathname.match(/^\/api\/admin\/wiki-content\/([^/]+)$/);
  if (!match) return json({ error: '接口不存在。' }, 404);

  const pageId = decodeURIComponent(match[1]);
  if (!/^[a-z0-9-]{2,100}$/.test(pageId)) return json({ error: '知识页 ID 不合法。' }, 400);

  if (request.method === 'PUT') {
    const body = await request.json().catch(() => null);
    const summary = typeof body?.summary === 'string' ? body.summary.trim() : '';
    const content = typeof body?.content === 'string' ? body.content.trim() : '';
    const status = body?.status === 'published' ? 'published' : 'draft';

    if (!content) return json({ error: '正文不能为空。' }, 400);
    if (content.length > 300000) return json({ error: '单篇正文不能超过 30 万字符。' }, 413);
    if (summary.length > 500) return json({ error: '摘要不能超过 500 字符。' }, 400);

    if (status === 'published') {
      await env.DB.prepare(`INSERT INTO wiki_content
        (page_id, draft_summary, draft_content, published_summary, published_content, status, updated_at, published_at)
        VALUES (?, ?, ?, ?, ?, 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(page_id) DO UPDATE SET
          draft_summary = excluded.draft_summary,
          draft_content = excluded.draft_content,
          published_summary = excluded.published_summary,
          published_content = excluded.published_content,
          status = 'published',
          updated_at = CURRENT_TIMESTAMP,
          published_at = CURRENT_TIMESTAMP`)
        .bind(pageId, summary, content, summary, content)
        .run();
    } else {
      await env.DB.prepare(`INSERT INTO wiki_content
        (page_id, draft_summary, draft_content, status, updated_at)
        VALUES (?, ?, ?, 'draft', CURRENT_TIMESTAMP)
        ON CONFLICT(page_id) DO UPDATE SET
          draft_summary = excluded.draft_summary,
          draft_content = excluded.draft_content,
          status = 'draft',
          updated_at = CURRENT_TIMESTAMP`)
        .bind(pageId, summary, content)
        .run();
    }

    const saved = await env.DB.prepare(`SELECT page_id, draft_summary AS summary,
      draft_content AS content, status, updated_at, published_at
      FROM wiki_content WHERE page_id = ?`).bind(pageId).first();
    return json({ item: saved });
  }

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM wiki_content WHERE page_id = ?').bind(pageId).run();
    return json({ ok: true });
  }

  return json({ error: '不支持的请求方法。' }, 405);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleWikiApi(request, env, url);
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : '服务器处理失败。' }, 500);
      }
    }

    if (!env.ASSETS) {
      return new Response('Static asset binding is unavailable.', { status: 500 });
    }

    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') return response;

    url.pathname = '/index.html';
    return env.ASSETS.fetch(new Request(url, request));
  },
};
