// 答题结果分析与复习建议
import { getMajorCategory, LEVEL1_CATEGORIES } from './categories';

// 每个大类的推荐参考书目
const RECOMMENDED_BOOKS = {
  '塑胶结构与模具': '《塑料产品结构设计手册》《注塑模具设计手册》',
  '钣金压铸型材': '《钣金冲压工艺与模具设计》《压铸模具设计》',
  '机械设计基础': '《GD&T几何公差入门与提高》《机械设计》(濮良贵)',
  '工程材料与表面': '《材料科学基础》《塑料材料手册》',
  '产品开发流程': '《新产品开发流程管理》《DFMA面向制造与装配的设计》',
  '高阶核心技术': '《DFMEA失效模式与影响分析》《可靠性工程》',
  '行业专项知识': '各行业产品设计规范与标准',
};

export function analyzeResults(details) {
  const catStats = {};
  details.forEach(d => {
    const major = getMajorCategory(d.category);
    if (!catStats[major]) catStats[major] = { total: 0, correct: 0 };
    catStats[major].total++;
    if (d.isCorrect) catStats[major].correct++;
  });

  const analysis = {
    totalScore: details.filter(d => d.isCorrect).length,
    totalQuestions: details.length,
    percentage: Math.round((details.filter(d => d.isCorrect).length / details.length) * 100),
    categories: [],
    weakCategories: [],
    strongCategories: [],
    summary: '',
    recommendation: '',
  };

  for (const cat of LEVEL1_CATEGORIES.filter(c => c.id !== 'all')) {
    const stats = catStats[cat.name];
    if (!stats) continue;
    const pct = Math.round((stats.correct / stats.total) * 100);
    const entry = {
      id: cat.id,
      category: cat.name,
      shortName: cat.name,
      correct: stats.correct,
      total: stats.total,
      percentage: pct,
      books: RECOMMENDED_BOOKS[cat.name] || '',
    };
    analysis.categories.push(entry);
    if (pct < 60) analysis.weakCategories.push(entry);
    else if (pct >= 80) analysis.strongCategories.push(entry);
  }

  const pct = analysis.percentage;
  if (pct >= 90) analysis.summary = '整体掌握扎实，面试前保持手感即可。';
  else if (pct >= 75) analysis.summary = '基础较好，但部分知识点仍有提升空间。';
  else if (pct >= 60) analysis.summary = '需系统性加强薄弱环节，建议重点复习以下方向。';
  else analysis.summary = '建议从基础概念开始系统复习，逐模块攻克后再来刷题。';

  if (analysis.weakCategories.length > 0) {
    const items = analysis.weakCategories.map(c =>
      `${c.shortName}（${c.correct}/${c.total}，${c.percentage}%） → ${c.books}`
    );
    analysis.recommendation = items.join('；');
  } else if (pct < 80) {
    analysis.recommendation = '各模块表现均衡，建议适当提升薄弱题型，保持学习节奏。';
  } else {
    analysis.recommendation = '各模块掌握良好，可以尝试交叉刷题或模拟考试保持状态。';
  }

  return analysis;
}
