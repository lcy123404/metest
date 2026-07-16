async function requestJson(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || '内容服务暂时不可用。');
  return data;
}

export async function loadPublishedWikiContent() {
  const data = await requestJson('/api/wiki-content');
  return data.items || [];
}

export async function loadAdminWikiContent() {
  const data = await requestJson('/api/admin/wiki-content');
  return data.items || [];
}

export async function saveWikiContent(pageId, payload) {
  const data = await requestJson(`/api/admin/wiki-content/${encodeURIComponent(pageId)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return data.item;
}

export async function resetWikiContent(pageId) {
  await requestJson(`/api/admin/wiki-content/${encodeURIComponent(pageId)}`, {
    method: 'DELETE',
  });
}

export async function loadWikiStructure(admin = false) {
  const data = await requestJson(admin ? '/api/admin/wiki-nodes' : '/api/wiki-structure');
  return data.items || [];
}

export async function createWikiNode(payload) {
  const data = await requestJson('/api/admin/wiki-nodes', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return data.item;
}

export async function updateWikiNode(nodeId, payload) {
  const data = await requestJson(`/api/admin/wiki-nodes/${encodeURIComponent(nodeId)}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return data.item;
}

export async function deleteWikiNode(nodeId) {
  return requestJson(`/api/admin/wiki-nodes/${encodeURIComponent(nodeId)}`, {
    method: 'DELETE',
  });
}

export async function importWikiMarkdown(modules, status = 'draft') {
  return requestJson('/api/admin/wiki-import', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ modules, status }),
  });
}
