// 两级分类系统：Level1 大类 → Level2 子类
// 所有子类通过 prefix 匹配到对应大类

export const LEVEL1_CATEGORIES = [
  { id: 'all', name: '全部', icon: '📚' },
  { id: 'plastic-mold', name: '塑胶结构与模具', icon: '🔧' },
  { id: 'sheetmetal-diecast', name: '钣金压铸型材', icon: '⚙️' },
  { id: 'mech-basics', name: '机械设计基础', icon: '📐' },
  { id: 'material-surface', name: '工程材料与表面', icon: '🧪' },
  { id: 'npi-process', name: '产品开发流程', icon: '📋' },
  { id: 'advanced-tech', name: '高阶核心技术', icon: '💡' },
  { id: 'industry-specific', name: '行业专项知识', icon: '🏭' },
];

// 子类 → 大类映射
const SUBCATEGORY_MAP = {
  // 塑胶结构与模具
  '塑胶材料与选型': 'plastic-mold',
  '塑胶结构设计规范': 'plastic-mold',
  '注塑工艺': 'plastic-mold',
  '塑胶模具基础': 'plastic-mold',
  '塑胶缺陷分析与解决': 'plastic-mold',
  '防水密封结构设计': 'plastic-mold',
  '辅材标准件与组装工艺': 'plastic-mold',
  '结构件设计': 'plastic-mold',
  '模具基础': 'plastic-mold',

  // 钣金压铸型材
  '钣金材料与工艺': 'sheetmetal-diecast',
  '压铸工艺': 'sheetmetal-diecast',
  '型材挤压': 'sheetmetal-diecast',
  'CNC加工': 'sheetmetal-diecast',
  '钣金冲压': 'sheetmetal-diecast',
  '压铸': 'sheetmetal-diecast',

  // 机械设计基础
  '公差配合与GD_T': 'mech-basics',
  '力学基础理论': 'mech-basics',
  '材料学通用基础': 'mech-basics',
  '螺纹连接与紧固设计': 'mech-basics',
  '齿轮与传动机构': 'mech-basics',
  '轴承与轴系设计': 'mech-basics',
  '公差与装配': 'mech-basics',
  '装配设计与干涉检查': 'mech-basics',
  '二维CAD与工程图': 'mech-basics',

  // 工程材料与表面
  '塑胶表面处理': 'material-surface',
  '金属表面处理': 'material-surface',
  '表面处理与后加工': 'material-surface',
  '材料与性能': 'material-surface',
  '安全与合规': 'material-surface',
  '图纸标准化与规范': 'material-surface',
  '焊接与表面工程': 'material-surface',

  // 产品开发流程
  '前期立项与可行性评估': 'npi-process',
  '详细设计与DFM评审': 'npi-process',
  'EVT_DVT_PVT样机验证': 'npi-process',
  '模具开发与试模跟进': 'npi-process',
  '量产交付与ECN变更': 'npi-process',
  'BOM_ECN_技术文档': 'npi-process',
  'DOE实验设计': 'npi-process',
  '产品开发流程': 'npi-process',
  '结构设计原则': 'npi-process',

  // 高阶核心技术
  'FEA力学仿真基础': 'advanced-tech',
  '热设计与散热': 'advanced-tech',
  '热管理设计': 'advanced-tech',
  'EMC电磁兼容': 'advanced-tech',
  'DFMEA失效模式分析': 'advanced-tech',
  '环境可靠性': 'advanced-tech',
  'E8D问题闭环': 'advanced-tech',
  '缺陷分析与解决': 'advanced-tech',

  // 行业专项知识
  '通信服务器消费电子': 'industry-specific',
  '连接器精密器件': 'industry-specific',
  '机器人机电穿戴医疗': 'industry-specific',
  '小家电其他': 'industry-specific',
};

export function getLevel1Category(subCategory) {
  if (!subCategory) return 'all';
  for (const [key, l1] of Object.entries(SUBCATEGORY_MAP)) {
    if (subCategory.includes(key)) return l1;
  }
  return 'all';
}

export function getL1Name(id) {
  const found = LEVEL1_CATEGORIES.find(c => c.id === id);
  return found ? found.name : '其他';
}

export function filterByLevel1(questions, l1Id) {
  if (l1Id === 'all') return questions;
  return questions.filter(q => getLevel1Category(q.category) === l1Id);
}

// 向后兼容别名（旧代码引用了 MAJOR_CATEGORIES 等）
export const MAJOR_CATEGORIES = LEVEL1_CATEGORIES.map(c => c.name);
export function getMajorCategory(sub) {
  const id = getLevel1Category(sub);
  return getL1Name(id);
}
export function filterByMajorCategory(qs, catName) {
  const id = LEVEL1_CATEGORIES.find(c => c.name === catName)?.id || 'all';
  return filterByLevel1(qs, id);
}
