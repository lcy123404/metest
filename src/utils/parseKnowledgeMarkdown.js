function cleanTitle(value) {
  return value.replace(/\s+#+\s*$/, '').trim();
}

function headingNumber(title) {
  const match = title.match(/^(\d+(?:\.\d+){0,3})(?:\s|[、：:.-])/);
  if (!match) return null;
  return { value: match[1], parts: match[1].split('.') };
}

function plainSummary(markdown, maxLength = 180) {
  const paragraph = markdown
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .find((item) => item && !item.startsWith('|')) || '';
  return paragraph
    .replace(/^[-*>#\d.\s]+/, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .slice(0, maxLength);
}

function scanHeadings(lines) {
  const headings = [];
  let inFence = false;
  lines.forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) headings.push({ line: index, level: match[1].length, title: cleanTitle(match[2]) });
  });
  return headings;
}

function detectModuleLevel(headings) {
  const explicitModules = headings.filter((heading) => /第.+模块|模块[一二三四五六七八九十\d]+/.test(heading.title));
  if (explicitModules.length) return Math.min(...explicitModules.map((heading) => heading.level));

  const minimum = Math.min(...headings.map((heading) => heading.level));
  const minimumHeadings = headings.filter((heading) => heading.level === minimum);
  if (minimum === 1 && minimumHeadings.length === 1) {
    const lowerLevels = headings.filter((heading) => heading.level > minimum).map((heading) => heading.level);
    if (lowerLevels.length) return Math.min(...lowerLevels);
  }
  return minimum;
}

function parseTreeDocument(lines, fileName) {
  const treeItems = lines.map((line) => {
    const match = line.match(/^((?:(?:│   )|(?:    ))*)(?:├── |└── )(.+)$/);
    if (!match) return null;
    return {
      depth: Math.floor(match[1].length / 4) + 1,
      title: cleanTitle(match[2]),
    };
  }).filter(Boolean);

  if (!treeItems.length) return null;
  const modules = [];
  const warnings = ['检测到树状目录格式，已按缩进自动生成层级。'];
  let currentModule = null;
  let currentPage = null;
  let currentChild = null;

  for (const item of treeItems) {
    if (item.depth === 1) {
      currentModule = { title: item.title, description: '', pages: [] };
      modules.push(currentModule);
      currentPage = null;
      currentChild = null;
      continue;
    }
    if (!currentModule) {
      currentModule = { title: fileName.replace(/\.md$/i, ''), description: '', pages: [] };
      modules.push(currentModule);
      warnings.push('部分节点缺少一级模块，已归入文件名模块。');
    }
    if (item.depth === 2) {
      currentPage = { title: item.title, summary: '', content: '', children: [] };
      currentModule.pages.push(currentPage);
      currentChild = null;
      continue;
    }
    if (!currentPage) {
      currentPage = { title: '未分组导入内容', summary: '', content: '', children: [] };
      currentModule.pages.push(currentPage);
      warnings.push(`“${item.title}”缺少二级上级，已放入临时页面。`);
    }
    if (item.depth === 3) {
      currentChild = { title: item.title, summary: '', content: '', children: [] };
      currentPage.children.push(currentChild);
      continue;
    }
    if (currentChild) currentChild.content = `${currentChild.content}\n- ${item.title}`.trim();
  }

  const firstPlainLine = lines.find((line) => line.trim() && !/[├└]──/.test(line))?.trim();
  const pages = modules.reduce((total, module) => total + module.pages.length, 0);
  const children = modules.reduce((total, module) => total + module.pages.reduce((count, page) => count + page.children.length, 0), 0);
  return {
    title: firstPlainLine || fileName.replace(/\.md$/i, ''),
    modules,
    stats: { modules: modules.length, pages, children },
    warnings,
  };
}

export function parseKnowledgeMarkdown(markdown, fileName = 'Markdown 导入') {
  const normalized = String(markdown || '').replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  const headings = scanHeadings(lines);
  if (!headings.length) {
    const treeResult = parseTreeDocument(lines, fileName);
    if (treeResult) return treeResult;
    throw new Error('没有识别到标题或树状目录，请使用 # 标题或 ├── 树状层级。');
  }

  const moduleLevel = detectModuleLevel(headings);
  const documentTitle = headings.length > 1 && headings[0].level < moduleLevel ? headings[0] : null;
  const modules = [];
  const warnings = [];
  let currentModule = null;
  let currentPage = null;
  let currentNode = null;

  const createModule = (title, inferred = false) => {
    const module = { title, description: '', contentLines: [], pages: [], inferred };
    modules.push(module);
    currentModule = module;
    currentPage = null;
    currentNode = module;
    return module;
  };

  const ensureModule = (numberInfo) => {
    if (currentModule) return currentModule;
    const prefix = numberInfo?.parts?.[0];
    const title = prefix ? `第 ${prefix} 模块（导入）` : fileName.replace(/\.md$/i, '');
    warnings.push(`未找到明确的一级模块，已自动创建“${title}”。`);
    return createModule(title, true);
  };

  const appendLine = (line) => {
    if (currentNode) currentNode.contentLines.push(line);
  };

  lines.forEach((line, lineIndex) => {
    const heading = headings.find((item) => item.line === lineIndex);
    if (!heading) {
      appendLine(line);
      return;
    }
    if (documentTitle && heading.line === documentTitle.line) {
      currentNode = null;
      return;
    }

    const numberInfo = headingNumber(heading.title);
    let kind;
    if (numberInfo?.parts.length >= 3) kind = 'child';
    else if (numberInfo?.parts.length === 2) kind = 'page';
    else if (heading.level <= moduleLevel) kind = 'module';
    else if (heading.level === moduleLevel + 1) kind = 'page';
    else if (heading.level === moduleLevel + 2) kind = 'child';
    else {
      appendLine(line);
      return;
    }

    if (kind === 'module') {
      createModule(heading.title);
      return;
    }

    if (numberInfo?.parts[0] && currentModule?.inferred) {
      const expectedPrefix = currentModule.title.match(/第\s*(\d+)\s*模块/)?.[1];
      if (expectedPrefix && expectedPrefix !== numberInfo.parts[0]) {
        createModule(`第 ${numberInfo.parts[0]} 模块（导入）`, true);
      }
    }

    ensureModule(numberInfo);
    if (kind === 'page') {
      const page = { title: heading.title, summary: '', contentLines: [], children: [] };
      currentModule.pages.push(page);
      currentPage = page;
      currentNode = page;
      return;
    }

    if (!currentPage) {
      currentPage = { title: `${numberInfo?.parts.slice(0, 2).join('.') || '未分组'} 导入内容`, summary: '', contentLines: [], children: [] };
      currentModule.pages.push(currentPage);
      warnings.push(`“${heading.title}”之前没有二级页面，已创建临时上级页面。`);
    }
    const child = { title: heading.title, summary: '', contentLines: [], children: [] };
    currentPage.children.push(child);
    currentNode = child;
  });

  const finalizeNode = (node) => {
    const content = node.contentLines.join('\n').trim();
    node.content = content;
    node.summary = node.summary || plainSummary(content);
    delete node.contentLines;
    node.children?.forEach(finalizeNode);
  };

  modules.forEach((module) => {
    const content = module.contentLines.join('\n').trim();
    module.description = plainSummary(content, 220);
    delete module.contentLines;
    delete module.inferred;
    module.pages.forEach(finalizeNode);
  });

  const pages = modules.reduce((total, module) => total + module.pages.length, 0);
  const children = modules.reduce((total, module) => total + module.pages.reduce((count, page) => count + page.children.length, 0), 0);
  if (!pages && !children) warnings.push('文档只识别到模块，导入后需要在目录管理中继续添加知识页。');

  return {
    title: documentTitle?.title || fileName.replace(/\.md$/i, ''),
    modules,
    stats: { modules: modules.length, pages, children },
    warnings,
  };
}

export default parseKnowledgeMarkdown;
