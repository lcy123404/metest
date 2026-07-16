const customPlaceholder = `## 待完善

这个知识页已经创建。请前往“知识内容管理”编写正文并发布。`;

function sortNodes(items) {
  return items.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'zh-CN'));
}

export function mergeWikiStructure(baseSections, nodeRecords = [], publishedRecords = []) {
  const overrides = new Map(nodeRecords.map((item) => [item.node_id, item]));
  const published = new Map(publishedRecords.map((item) => [item.page_id, item]));
  const baseSectionIds = new Set(baseSections.map((section) => section.id));
  const basePageIds = new Set();

  const sections = baseSections
    .map((section, sectionIndex) => {
      const override = overrides.get(section.id);
      if (override?.is_hidden) return null;
      return {
        ...section,
        title: override?.title ?? section.title,
        description: override?.description ?? section.description,
        sortOrder: override?.sort_order ?? sectionIndex * 1000,
        isCustom: false,
        pages: [],
      };
    })
    .filter(Boolean);

  for (const record of nodeRecords) {
    if (record.node_type !== 'section' || baseSectionIds.has(record.node_id) || record.is_hidden) continue;
    sections.push({
      id: record.node_id,
      title: record.title,
      description: record.description || '',
      sortOrder: record.sort_order,
      isCustom: true,
      pages: [],
    });
  }

  const pageMap = new Map();
  const registerBasePages = (pages, parentId, sectionId) => {
    pages.forEach((page, index) => {
      basePageIds.add(page.id);
      const override = overrides.get(page.id);
      if (override?.is_hidden) return;
      pageMap.set(page.id, {
        ...page,
        ...(published.get(page.id) || {}),
        title: override?.title ?? page.title,
        summary: override?.summary ?? page.summary,
        level: override?.level ?? page.level,
        parentId: override?.parent_id ?? parentId,
        originalParentId: parentId,
        sectionId,
        sortOrder: override?.sort_order ?? index * 1000,
        isCustom: false,
        children: [],
      });
      registerBasePages(page.children || [], page.id, sectionId);
    });
  };

  for (const section of baseSections) registerBasePages(section.pages, section.id, section.id);

  for (const record of nodeRecords) {
    if (record.node_type !== 'page' || basePageIds.has(record.node_id) || record.is_hidden) continue;
    const liveContent = published.get(record.node_id);
    pageMap.set(record.node_id, {
      id: record.node_id,
      title: record.title,
      summary: liveContent?.summary || record.summary || '',
      content: liveContent?.content || customPlaceholder,
      level: record.level || '基础',
      sources: ['知识库后台自定义内容'],
      parentId: record.parent_id,
      originalParentId: record.parent_id,
      sortOrder: record.sort_order,
      isCustom: true,
      children: [],
    });
  }

  const sectionMap = new Map(sections.map((section) => [section.id, section]));
  for (const page of pageMap.values()) {
    const parentPage = pageMap.get(page.parentId);
    if (parentPage) parentPage.children.push(page);
    else sectionMap.get(page.parentId)?.pages.push(page);
  }

  sortNodes(sections);
  for (const section of sections) {
    sortNodes(section.pages);
    const sortChildren = (page) => {
      sortNodes(page.children);
      page.children.forEach(sortChildren);
    };
    section.pages.forEach(sortChildren);
  }

  const pages = [];
  for (const section of sections) {
    const visit = (page, parent = null) => {
      pages.push({
        ...page,
        sectionId: section.id,
        sectionTitle: section.title,
        parentId: parent?.id || section.id,
        parentTitle: parent?.title,
      });
      page.children.forEach((child) => visit(child, page));
    };
    section.pages.forEach((page) => visit(page));
  }

  return { sections, pages };
}

export default mergeWikiStructure;
