import knowledgeArticles from './knowledge.js';
import { plasticMaterialCoursePages, plasticMaterialsOverview } from './plasticMaterialsCourse.js';

const legacyContent = (id) => knowledgeArticles.find((article) => article.id === id)?.content || '';

const materialSources = [
  '《产品结构设计实例教程》：常用结构材料及注塑缺陷分析',
  '《面向制造和装配的产品设计指南》：塑胶材料的选择与性能参数',
  '参考资料/WB资料/3-塑胶材料：塑胶材料性能介绍及对比',
];

const roadmapSources = [
  '《产品结构设计实例教程》：产品开发流程与完整设计实例',
  'MIT OpenCourseWare：Product Design and Development',
  'MIT OpenCourseWare：Design and Manufacturing II',
  'Apple Product Design Engineer：岗位职责与能力要求',
];

const sourceWikiSections = [
  {
    id: 'start-here',
    title: '从这里开始',
    description: '先理解岗位、产品闭环和学习顺序，再进入各技术领域。',
    pages: [
      {
        id: 'zero-to-one-roadmap',
        title: '从零到一学习地图',
        summary: '用十个阶段把需求、设计、验证和量产串成一条主线。',
        level: '起点',
        sources: roadmapSources,
        content: `
## 先看完整产品，而不是先背知识点

产品结构工程师的任务，是把用户需求、外观和电子/机电功能，转化为在目标成本、质量、周期和产量下可以稳定制造、装配、测试和使用的物理产品。

学习主线应当复现这条工作链：

| 阶段 | 核心问题 | 主要产出 |
|---|---|---|
| 0 认识产品与岗位 | 产品由什么组成，结构工程师负责什么 | 拆解图、接口清单、约束矩阵 |
| 1 工程表达与量测 | 如何准确表达和检查设计意图 | 3D、2D、BOM、量测报告 |
| 2 材料与选型 | 零件为什么用这种材料 | 材料选型矩阵、验证计划 |
| 3 制造与 DFM | 几何如何被稳定制造出来 | 工艺路线、DFM 风险清单 |
| 4 零件特征设计 | 壁厚、筋、柱、孔和基准怎样设计 | 可制造零件、特征检查表 |
| 5 装配与产品架构 | 零件怎样定位、固定、防错和维修 | 爆炸图、装配顺序、接口控制 |
| 6 公差与尺寸质量 | 有制造波动时是否仍能工作 | 尺寸链、GD&T、量测方案 |
| 7 物理性能与可靠性 | 产品会怎样变形、发热、泄漏或磨损 | 载荷/热/密封路径、可靠性风险 |
| 8 原型、测试与失效 | 如何用证据淘汰错误设计 | DVP&R、DFMEA、失效分析 |
| 9 NPI 与量产 | 如何把样机变成稳定、可复制的产品 | 试产闭环、ECN、量产控制文件 |

## 初学者的四条推荐路径

1. **新手起步**：阶段 0~3，先认识产品、材料与制造。
2. **核心设计**：阶段 4~6，完成零件、装配和公差闭环。
3. **系统与验证**：阶段 7~8，理解物理失效并用测试验证。
4. **量产进阶**：阶段 9 与行业专题，处理供应商和量产问题。

> 软件是表达工具，题库是概念检查。真正的掌握必须由设计产出、实物验证和问题闭环来证明。
`,
      },
      {
        id: 'role-and-product-loop',
        title: '结构工程师在做什么',
        summary: '理解岗位边界、六类约束和从需求到量产的责任链。',
        level: '起点',
        sources: roadmapSources,
        content: `
## 岗位的本质

结构工程师并不是把外观画成三维的人。岗位的核心，是在功能、几何、物理、制造、质量和商业六类约束之间做可验证的工程权衡。

## 六类约束

- **功能**：产品要完成什么任务，哪些是必须满足的性能。
- **几何**：零件如何布局、定位、运动、连接和维修。
- **物理**：载荷、变形、温度、流体、摩擦、声学和电磁怎样传递。
- **制造**：材料和工艺是否能以目标节拍和良率稳定生产。
- **质量**：尺寸波动、环境老化和用户误用下是否仍能工作。
- **商业**：成本、周期、供应、法规和售后是否可以接受。

## 完整责任链

1. 澄清需求和未知条件。
2. 建立产品架构、堆叠和接口。
3. 生成多个方案并比较风险。
4. 选择材料、工艺、连接和尺寸控制方式。
5. 完成详细设计、图纸和 BOM。
6. 用样机、计算、仿真和试验验证。
7. 参与 DFM、试模、试产和供应商问题关闭。
8. 通过数据、ECN 和标准化维持量产。

## 成熟度的判断

会建模只能证明能表达几何；能独立说明设计依据、预测失效、制定验证并关闭量产问题，才说明具备产品结构能力。
`,
      },
      {
        id: 'knowledge-network',
        title: '知识如何连接',
        summary: '把目录树转化为材料、工艺、结构、公差和验证之间的因果网络。',
        level: '方法',
        sources: roadmapSources,
        content: `
## 知识库不是互不相关的文件夹

真实设计中的每个决定都会跨越多个领域。例如一个防水按键同时涉及 TPU/硅胶材料、成型工艺、按压力与行程、密封压缩量、公差链、寿命测试和装配防错。

## 四条因果链

| 因果链 | 需要连续回答的问题 |
|---|---|
| 功能链 | 用户需求 -> 产品功能 -> 模组功能 -> 零件功能 -> 验证指标 |
| 实现链 | 材料 -> 制造工艺 -> 零件特征 -> 连接装配 -> 整机架构 |
| 质量链 | 基准 -> 公差 -> 量测 -> 制程能力 -> 功能一致性 |
| 失效链 | 工况 -> 载荷/热/密封路径 -> 失效模式 -> 检测 -> 预防与验证 |

## 每个知识页都应回答

1. 它解决什么工程问题。
2. 学习它需要哪些前置知识。
3. 关键变量和边界条件是什么。
4. 如何比较方案并做决策。
5. 常见失效模式是什么。
6. 如何通过样件、量测或试验验证。
7. 会形成什么工程输出，并关联哪些题目。

## 学习与查询是两种不同体验

学习模式只展示阶段路径和推荐题量；Wiki 保留完整领域树，方便在设计、答题和错题复盘时精确反查。
`,
      },
      {
        id: 'project-milestones',
        title: '项目关卡与能力等级',
        summary: '用项目证据判断掌握程度，避免把看过和会做混为一谈。',
        level: '方法',
        sources: roadmapSources,
        content: `
## 四级能力

| 等级 | 能力表现 |
|---|---|
| L1 认识 | 能解释概念、识别典型结构和主要风险 |
| L2 应用 | 能在规范和指导下完成零件、图纸、选型或简单分析 |
| L3 闭环 | 能独立定义问题、比较方案、完成设计和验证并关闭制造问题 |
| L4 架构与优化 | 能跨专业权衡性能、成本、质量和周期，并建立可复用标准 |

## 五个项目关卡

1. **三件式桌面产品**：训练量测、CAD、工程图、基础材料工艺和装配。
2. **手持电子产品外壳**：训练 PCB/电池/按键/接口堆叠、塑胶结构和模具 DFM。
3. **防水便携产品**：训练密封路径、压缩量、公差链、透气和环境验证。
4. **带运动机构的小产品**：训练轴、轴承、齿轮/连杆、磨损、寿命和异响。
5. **EVT 到 PVT 量产案例**：训练 DFMEA、试模、尺寸报告、DOE、ECN、良率和成本。

## 统一提交物

每个项目都应提交需求与约束、方案对比、3D/2D/BOM、关键计算、公差分析、DFMEA、验证计划、问题闭环和项目复盘。

> 完成课程或刷完题目不是毕业条件；能拿出一套可审查的产品开发证据链才是。
`,
      },
    ],
  },
  {
    id: 'engineering-language',
    title: '工程表达与量测',
    description: '学会读图、建模、测量和管理设计数据。',
    pages: [
      {
        id: 'drawing-measurement-basics',
        title: '图纸、量测与设计意图',
        summary: '先能读懂、表达和验证几何，再进入完整公差体系。',
        level: '入门',
        sources: ['《产品结构设计实例教程》：机械制图与常用资料输出', '《GD&T几何公差入门与提高》'],
        content: `
## 为什么先学工程语言

3D 模型描述名义几何，2D 图纸描述制造、检验和功能要求，量测则把实物反馈成数据。三者必须闭环。

## 入门顺序

1. 三视图、剖视图、断面图和局部放大。
2. 尺寸、上下偏差、配合、粗糙度和技术要求。
3. 卡尺、千分尺、高度规、塞规、投影仪和 CMM 的基本用途。
4. 参数化建模、装配约束、干涉检查和模型版本。
5. 从功能面和装配关系选择标注起点，避免闭环尺寸和重复约束。

## 先达到的能力

- 能从实物建立可复核的零件模型。
- 能用合理视图表达零件，而不是把所有尺寸塞在一个视图中。
- 能指出某个尺寸用什么量具测，以及测量基准在哪里。
- 能区分模型错误、图纸错误、制造偏差和量测偏差。
`,
      },
      {
        id: 'cad-bom-change',
        title: 'CAD、BOM 与变更管理',
        summary: '把建模工具放回产品数据和版本控制的工作流中。',
        level: '入门',
        sources: ['《产品结构设计实例教程》：BOM、工程图与资料输出'],
        content: `
## CAD 的正确定位

CAD 用来表达架构、几何、接口和配置，也用于干涉、质量属性和图纸联动。软件熟练度重要，但不能代替材料、工艺、公差和验证决策。

## 产品数据链

- 3D：零件、组件、骨架、配置和接口。
- 2D：尺寸、公差、材料、表面处理和技术要求。
- BOM：物料层级、数量、版本、替代料和供应属性。
- ECR/ECN：变更原因、影响范围、验证证据、切换批次和库存处置。
- 发布包：模型、图纸、BOM、规格书、检验与装配要求保持一致。

## 常见失败

- 只改 3D，没有同步图纸和 BOM。
- 文件名充当版本管理，无法追溯已发布状态。
- 自顶向下关联过度，局部修改导致大面积意外更新。
- 变更只描述“改了什么”，没有说明原因、风险和验证结果。
`,
      },
    ],
  },
  {
    id: 'materials',
    title: '材料基础',
    description: '先建立分类与性能语言，再认识具体材料并完成选型。',
    pages: [
      {
        id: 'materials-start',
        title: '材料学习路线',
        summary: '结构工程师学习材料的顺序和目标。',
        level: '入门',
        sources: materialSources,
        content: `
## 为什么先学材料

结构设计不是先画形状，而是先确认零件在什么环境中工作、承受什么载荷、用什么工艺制造。材料决定强度、刚度、重量、外观、寿命、成本，也决定壁厚、圆角、卡扣和公差能做到什么程度。

## 推荐学习顺序

1. **材料分类**：分清塑料、金属、弹性体、胶粘剂和复合材料。
2. **性能指标**：理解强度、刚度、韧性、耐热、收缩、吸水和阻燃。
3. **常用材料**：先掌握 ABS、PC、PP、POM、PA，再学习铝、钢、不锈钢和铜。
4. **制造约束**：材料必须和注塑、钣金、压铸、CNC、挤出等工艺一起看。
5. **选型与验证**：用工况筛选候选材料，再通过样件和测试确认。

> 学材料的目标不是背牌号，而是能解释“为什么这个零件用它，以及不用其他材料的原因”。

## 学完后应能回答

- 承力件为什么不能只比较拉伸强度？
- 透明外壳为什么常用 PC 或 PMMA，它们的取舍是什么？
- 齿轮为什么常用 POM 或 PA，而不是 ABS？
- 户外零件为什么要关注 UV、吸水和温度循环？
- 铝合金 5052 与 6061 分别适合什么制造方式？
`,
      },
      {
        id: 'materials-classification',
        title: '材料如何分类',
        summary: '按材料家族、受热行为和结构用途建立全局地图。',
        level: '入门',
        sources: materialSources,
        content: `
## 五类常见结构材料

| 材料家族 | 核心特点 | 常见应用 |
|---|---|---|
| 塑料 | 轻、易成型、绝缘、可做复杂结构 | 外壳、支架、卡扣、齿轮 |
| 金属 | 强度和刚度高、导热导电、耐高温 | 骨架、机箱、轴、散热件 |
| 弹性体 | 可大变形、缓冲、密封、提供手感 | 密封圈、脚垫、按键、包胶 |
| 胶粘剂与胶带 | 连接异种材料、密封、分散应力 | 屏幕粘接、电池固定、防水 |
| 复合材料 | 通过增强相获得更高比强度或特殊性能 | 玻纤塑料、碳纤维件、夹层结构 |

## 塑料的两种基本类型

### 热塑性塑料

受热软化、冷却固化，可重复加工。ABS、PC、PP、POM、PA、PMMA 都属于热塑性塑料，是消费电子和结构件最常用的一类。

### 热固性塑料

固化后形成交联结构，再加热不会重新熔化。它通常耐热、尺寸稳定、绝缘性好，但回收和再次成型困难。环氧树脂、酚醛树脂、不饱和聚酯是典型代表。

## 金属的基本分类

- **黑色金属**：钢、铸铁。成本和刚度优势明显。
- **有色金属**：铝、铜、锌、镁、钛等。常用于轻量化、导电、导热或耐腐蚀场景。
- **合金**：通过加入其他元素改变强度、耐蚀、加工和热处理性能。工程中使用的金属大多是合金。

## 分类不是选型结论

同一材料家族内部差异很大。例如未增强 PA 吸水明显，而玻纤增强 PA 的刚度和尺寸稳定性更高；6061-T6 强度较高、适合 CNC，但折弯性通常不如 5052-H32。分类只负责缩小范围，最终仍要回到具体牌号、状态和工艺。
`,
      },
      {
        id: 'materials-properties',
        title: '读懂材料性能参数',
        summary: '把数据表里的指标翻译成真实结构表现。',
        level: '基础',
        sources: materialSources,
        content: `
## 力学性能

- **拉伸强度**：材料拉断前能承受的最大应力，不等于零件一定安全。
- **屈服强度**：开始产生不可恢复塑性变形的应力，金属承力设计通常更关注它。
- **弹性模量**：反映刚度。模量越高，同样结构和载荷下变形通常越小。
- **冲击强度**：材料抵抗突然冲击和缺口破坏的能力。
- **断裂伸长率**：材料拉断前的变形能力，可辅助判断韧性和折弯能力。
- **蠕变**：恒定载荷下随时间继续变形。塑料卡扣、螺丝柱和长期承力件必须考虑。

## 热性能

- **玻璃化转变温度 Tg**：非晶塑料从硬玻璃态向高弹态转变的温度区间。
- **热变形温度 HDT**：规定载荷下出现规定变形时的温度，适合比较承载耐热能力。
- **维卡软化温度**：规定压针条件下材料软化的温度，不应直接当作长期使用温度。
- **线膨胀系数 CTE**：温度变化引起的尺寸变化。塑胶与金属装配时差异尤其重要。

## 成型与尺寸性能

- **收缩率**影响模具尺寸补偿和成品尺寸稳定性。
- **熔体流动速率 MFR/MFI**反映规定条件下的流动能力，但不能单独代表所有成型性能。
- **吸水率**会改变 PA 等材料的尺寸、刚度和电性能。
- **各向异性**在玻纤增强材料中明显，会带来流动方向与横向收缩、强度差异。

## 环境与法规性能

耐化学、耐候、耐水解、阻燃、食品接触、RoHS、REACH 都属于选型门槛。合规不是“材料名称合规”，而是具体牌号、颜色、添加剂和供应商批次满足要求。

> 数据表用于筛选，真实零件性能还受壁厚、缺口、熔接线、成型参数、老化和装配应力影响。
`,
      },
      {
        id: 'plastics-overview',
        title: '塑料选型总览',
        summary: '通用塑料、工程塑料和高性能塑料的使用边界。',
        level: '基础',
        sources: materialSources,
        content: `
## 三个使用层级

### 通用塑料

PP、PE、PS、PVC 等成本较低、产量大。适合一般外壳、容器、薄壁件和非高载荷零件。其中 PP 密度低、耐化学性好，但表面能低，喷涂和粘接通常需要预处理。

### 工程塑料

ABS、PC、PA、POM、PBT、PMMA 等具有更好的力学、耐热或尺寸性能。它们承担外观壳体、卡扣、支架、齿轮、连接器和透明件等主要结构任务。

### 高性能塑料

PPS、PEI、PEEK、LCP 等用于高温、精密、电气或化学环境。材料价格和加工要求更高，不应因为“性能高”就默认使用。

## 塑料选型的七个问题

1. 零件承受什么载荷，持续多久？
2. 工作温度、峰值温度和热循环范围是多少？
3. 是否接触水、油、汗液、清洁剂或户外 UV？
4. 外观、透明、颜色和表面处理要求是什么？
5. 采用什么装配方式，是否有卡扣、螺丝或超声波焊？
6. 尺寸稳定和公差要求有多高？
7. 阻燃、食品接触、医疗或环保法规是什么？

## 常见误区

- 只比较强度，不比较模量、缺口冲击和蠕变。
- 只看原始材料数据，不考虑吸水和温度后的性能。
- 直接套用“典型收缩率”，不确认具体牌号与成型条件。
- 为了提高刚度盲目加玻纤，却忽略翘曲、浮纤和模具磨损。
`,
      },
      {
        id: 'common-plastics',
        title: 'ABS、PC、PP、POM、PA 怎么选',
        summary: '五种高频塑料的特点、应用与主要风险。',
        level: '核心',
        sources: materialSources,
        content: `
## 快速对比

| 材料 | 优势 | 主要短板 | 典型应用 |
|---|---|---|---|
| ABS | 综合性能、外观、喷涂电镀、成本平衡 | 耐候和耐热一般 | 外壳、面板、装饰件 |
| PC | 高冲击、透明、尺寸稳定、耐热较好 | 易应力开裂、耐刮差、加工温度高 | 透明罩、防护壳、承冲击件 |
| PP | 密度低、耐化学、耐疲劳、成本低 | 刚度和尺寸稳定一般、难粘接喷涂 | 活铰链、容器、耐化学件 |
| POM | 耐磨、自润滑、尺寸稳定、低摩擦 | 难粘接、酸碱环境受限、加工需防分解 | 齿轮、轴套、滑块、精密机构 |
| PA | 强韧、耐磨、耐疲劳、可玻纤增强 | 吸水导致尺寸和性能变化 | 齿轮、支架、连接器、承力件 |

## ABS

ABS 由丙烯腈、丁二烯和苯乙烯三部分提供耐化学、韧性和加工外观的平衡。它适合做外观壳体和需要喷涂、电镀的零件。户外长期使用应考虑 ASA 或耐候改性牌号。

## PC 与 PC+ABS

PC 的冲击和透明优势突出，但残余应力、酒精或清洁剂可能诱发应力开裂。PC+ABS 用 ABS 改善流动和加工性，用 PC 提高耐热与冲击，是电子外壳常见折中方案。

## PP

PP 的耐疲劳使它适合活铰链，低密度有利于轻量化。其高收缩和低表面能会增加尺寸、喷涂和粘接难度。滑石粉填充可提高刚度和尺寸稳定性，但冲击性能会变化。

## POM

POM 适合摩擦副和精密运动件。设计时要避免尖角和长期高应力，也要注意均聚、共聚牌号在强度、耐热和化学稳定性上的差异。

## PA

PA6、PA66 常用于承力和耐磨零件。吸水后材料会增韧但刚度下降、尺寸变化；玻纤增强能提高刚度和耐热，却会增加各向异性、翘曲和表面浮纤。
`,
      },
      {
        id: 'metals-overview',
        title: '常用金属材料地图',
        summary: '钢、铝、铜、锌和镁的结构设计角色。',
        level: '基础',
        sources: materialSources,
        content: `
## 金属选型先看制造方式

金属材料往往和工艺绑定：薄钢板适合冲压折弯，铝合金可做钣金、CNC、挤出或压铸，不锈钢适合耐蚀和高强薄壁件，锌合金适合小型复杂压铸件，铜合金常用于导电、导热和弹性端子。

## 常见家族

| 家族 | 关键特点 | 常见工艺与应用 |
|---|---|---|
| 碳钢 | 刚度高、成本低、易加工，需防腐 | SPCC 钣金、轴、支架 |
| 不锈钢 | 耐蚀、强度高，加工硬化明显 | SUS301 弹片、SUS304 外壳 |
| 铝合金 | 轻、导热、耐蚀、表面处理丰富 | 5052 钣金、6061 CNC/型材、ADC12 压铸 |
| 铜合金 | 导电导热好，可获得弹性 | 端子、屏蔽、散热、衬套 |
| 锌合金 | 流动性好、尺寸精度和表面质量好 | 小型压铸件、装饰件 |
| 镁合金 | 密度低、减振和压铸性能好 | 轻量化壳体，但要关注腐蚀和防护 |

## 金属数据表重点

金属结构件通常关注屈服强度、抗拉强度、弹性模量、伸长率、硬度、疲劳、导热、耐蚀和热处理状态。牌号相同但状态不同，性能可能显著变化，例如 6061-O 与 6061-T6 不应视为同一种设计输入。
`,
      },
      {
        id: 'aluminum-steel',
        title: '铝合金与钢材的高频牌号',
        summary: '理解 5052、6061、ADC12、SPCC、SUS301 和 SUS304。',
        level: '核心',
        sources: materialSources,
        content: `
## 铝合金

### 5052-H32

耐蚀和折弯性能较好，常用于钣金外壳、支架和罩壳。它不是热处理强化合金，强度通常低于 6061-T6，但成形性更适合折弯件。

### 6061-T6

强度、CNC 加工和阳极氧化综合性能好，常用于机加工框架、支架、散热结构和型材。T6 状态折弯时更容易开裂，设计不能直接照搬 5052 的折弯半径。

### ADC12

流动性和压铸性能好，是常见铝压铸材料。适合复杂壳体，但内部气孔会影响气密、焊接和高温热处理，关键密封面通常需要后加工和泄漏验证。

## 钢与不锈钢

### SPCC

普通冷轧钢板，成本低、冲压折弯性能好，常用于内部机架和钣金件。表面通常需要喷粉、电镀或其他防腐处理。

### SUS301

加工硬化能力强，可获得较高强度和弹性，常用于弹片、卡簧和需要回弹的薄片结构。

### SUS304

耐蚀和综合性能好，广泛用于外观件、耐腐蚀零件和食品相关场景。折弯回弹、加工硬化和刀具磨损通常比普通碳钢明显。

## 选择提示

- 折弯钣金优先比较延伸率、状态和轧制方向。
- CNC 件关注强度、切削性、阳极外观和材料利用率。
- 弹片关注屈服、疲劳、硬度状态和应力松弛。
- 户外或盐雾环境不能只凭“不锈钢”三个字判断耐蚀能力。
`,
      },
      {
        id: 'elastomers-adhesives',
        title: '弹性体、软胶与胶粘剂',
        summary: '密封、缓冲、手感和粘接材料的基础。',
        level: '进阶',
        sources: materialSources,
        content: `
## 弹性体解决什么问题

弹性体通过可恢复变形提供密封、缓冲、减振、防滑和按键手感。结构设计要同时考虑硬度、压缩量、压缩永久变形、耐温、耐介质和老化。

## 常见材料

- **硅胶**：耐高低温、耐候和电绝缘性能好，常用于按键、密封和医疗接触件。
- **TPU**：耐磨、强度高，可注塑和包胶，适合保护套、滚轮、线缆和软触感结构。
- **TPE/TPR**：加工便利、触感和成本选择多，常用于握持和包胶。
- **NBR**：耐油性能突出，常用于油环境密封。
- **EPDM**：耐候、耐臭氧和耐水，常用于户外和汽车密封。

## 胶粘剂与胶带

胶粘连接能分散应力并连接异种材料，但表面能、清洁度、间隙、固化、温湿度和长期蠕变都会影响可靠性。双面胶选型不能只看初粘力，还要看基材、厚度、剥离、剪切、耐温和返修需求。

## 密封设计重点

O 形圈和泡棉密封都需要控制压缩量，过小会泄漏，过大会增加装配力并加速永久变形。槽尺寸、公差、表面粗糙度和接缝位置必须一起进入尺寸链。
`,
      },
      {
        id: 'material-selection-method',
        title: '材料选型方法',
        summary: '从需求定义到候选材料和供应链确认。',
        level: '核心',
        sources: materialSources,
        content: `
## 第一步：定义工况

把需求写成可以验证的条件：载荷类型与持续时间、温度范围、化学介质、户内外、寿命、跌落和振动、外观、法规、目标成本和预计产量。

## 第二步：设置淘汰门槛

阻燃、食品接触、耐温、透明、导电、密度或制造方式通常可以直接排除大量材料。门槛条件应先于“性能越高越好”的比较。

## 第三步：比较候选方案

建议同时比较：

- 功能：强度、刚度、冲击、摩擦、导热或绝缘。
- 制造：流动、收缩、折弯、切削、表面处理和良率。
- 装配：卡扣、螺丝、焊接、粘接和返修。
- 可靠性：蠕变、疲劳、吸水、UV、化学和温度循环。
- 商务：单价、最小采购量、交期、供应商和替代料。

## 第四步：把材料写进工程文件

图纸和 BOM 应使用足够明确的材料描述，包括材料家族、具体牌号、增强或阻燃等级、颜色、表面状态、供应商限制和适用标准。只写“PC”“铝”通常不足以控制量产。

## 一个简单例子

小型传动齿轮需要低摩擦、耐磨、尺寸稳定和批量注塑。ABS 外观好但耐磨一般；PA 耐磨但吸水尺寸变化明显；POM 自润滑、低摩擦且尺寸稳定，通常成为更合适的候选。随后仍需验证载荷、温度、寿命、噪声和润滑条件。
`,
      },
      {
        id: 'material-validation',
        title: '材料验证与常见失效',
        summary: '让材料数据通过真实零件、环境和寿命测试。',
        level: '进阶',
        sources: materialSources,
        content: `
## 为什么必须验证

材料数据表通常来自标准试样，真实零件却存在缺口、熔接线、残余应力、装配预紧、厚度变化和老化。选型完成只代表“候选合理”，不代表设计已经可靠。

## 常见失效模式

- 塑料螺丝柱在预紧和化学介质下发生应力开裂。
- 卡扣因长期保持变形发生蠕变，保持力逐渐下降。
- PA 吸水后尺寸变化，引起装配间隙和齿轮啮合变化。
- 玻纤增强塑料因流向导致翘曲和方向性强度差异。
- 金属与塑料热膨胀不匹配，温度循环后产生松动或开裂。
- 铝和异种金属接触，在潮湿环境中发生电偶腐蚀。

## 验证层级

1. **材料级**：核对牌号数据、认证、批次和测试报告。
2. **零件级**：尺寸、外观、强度、蠕变、跌落和化学测试。
3. **组件级**：装配力、保持力、密封、疲劳和温度循环。
4. **整机级**：真实载荷、环境、用户操作和寿命组合验证。

## 变更控制

换牌号、换供应商、改色母、调整玻纤比例或阻燃体系都可能改变成型和可靠性。材料变更应走工程变更流程，并根据风险重新验证，而不是只比较材料名称。
`,
      },
    ],
  },
  {
    id: 'plastic-design',
    title: '塑胶结构设计',
    description: '从成型约束理解壁厚、筋、柱、卡扣和脱模。',
    pages: [{ id: 'plastic-design-system', title: '塑胶结构设计总览', summary: '壁厚、筋、柱、卡扣和脱模是一套相互影响的系统。', level: '核心', sources: ['《面向制造和装配的产品设计指南》：塑胶件设计指南'], content: legacyContent('plastic-part-design') }],
  },
  {
    id: 'injection',
    title: '注塑与模具',
    description: '从模具和工艺理解成型缺陷。',
    pages: [{ id: 'injection-system', title: '注塑、模具与缺陷', summary: '用材料、结构、模具和参数四层框架分析问题。', level: '核心', sources: ['《产品结构设计实例教程》：模具基础知识'], content: legacyContent('injection-mold-process') }],
  },
  {
    id: 'metal-process',
    title: '金属制造工艺',
    description: '钣金、压铸、CNC 和型材的设计边界。',
    pages: [{ id: 'metal-process-system', title: '钣金、压铸、CNC 与型材', summary: '按材料如何成形理解结构约束。', level: '核心', sources: ['《面向制造和装配的产品设计指南》：钣金件、压铸件与机械加工件'], content: legacyContent('metal-processes') }],
  },
  {
    id: 'assembly',
    title: '装配与连接',
    description: '定位、固定、防错、维修和密封。',
    pages: [{ id: 'assembly-system', title: '装配设计与 DFA', summary: '先定位，再固定，最后考虑防错与维修。', level: '核心', sources: ['《面向制造和装配的产品设计指南》：面向装配的设计'], content: legacyContent('assembly-dfa') }],
  },
  {
    id: 'tolerance',
    title: '公差与工程图',
    description: '基准、尺寸链、GD&T 和制程能力。',
    pages: [{ id: 'tolerance-system', title: '公差、基准与 GD&T', summary: '用功能和基准建立尺寸控制体系。', level: '进阶', sources: ['《GD&T几何公差入门与提高》', '《面向制造和装配的产品设计指南》：公差分析'], content: legacyContent('tolerance-gdt') }],
  },
  {
    id: 'surface',
    title: '表面与外观',
    description: '工艺、基材、外观和可靠性的匹配。',
    pages: [{ id: 'surface-system', title: '表面处理与外观验证', summary: '喷涂、电镀、PVD、阳极、镭雕和印刷。', level: '进阶', sources: ['《产品结构设计实例教程》：常用表面处理知识'], content: legacyContent('surface-finishing') }],
  },
  {
    id: 'mechanical',
    title: '机械设计基础',
    description: '力学、强度、齿轮、轴承和传动机构。',
    pages: [
      {
        id: 'mechanics-strength',
        title: '力学、强度与刚度',
        summary: '用载荷路径、应力、变形和安全系数理解承力结构。',
        level: '基础',
        sources: ['题库：机械通用基础与力学基础理论'],
        content: `
## 先分清强度和刚度

强度描述结构抵抗破坏或永久变形的能力，刚度描述结构抵抗弹性变形的能力。零件没有断裂并不代表设计合格，过大变形同样可能导致干涉、异响、密封失效或光学偏移。

## 载荷路径

分析结构时先画清楚力从哪里输入、经过哪些零件和连接、最后由哪里支撑。载荷路径中突然变薄、尖角、孔边、螺纹根部和刚度突变位置容易产生应力集中。

## 常见载荷

- 拉伸与压缩：关注截面积、屈服、失稳和接触压溃。
- 弯曲：截面高度对抗弯刚度影响很大，加强筋通常比单纯加厚更有效。
- 扭转：轴和薄壁壳体要关注扭转刚度、键槽与孔洞削弱。
- 冲击与疲劳：瞬时峰值和循环载荷可能比静载更危险。

## 安全系数

安全系数要结合载荷不确定性、材料离散、制造缺陷、环境老化、失效后果和验证水平确定。安全系数不是越大越好，过度保守会增加重量、成本和制造难度。
`,
      },
      {
        id: 'transmission-bearing',
        title: '齿轮、轴承与传动',
        summary: '建立传动比、承载、寿命、润滑与装配的基础框架。',
        level: '进阶',
        sources: ['参考资料/WB资料/9-齿轮传动：传动教程资料', '题库：齿轮与传动机构、轴承与轴系设计'],
        content: `
## 传动方案怎么选

齿轮传动紧凑、传动比准确、承载能力高；同步带噪声低、可远距离布置并有一定缓冲；链传动耐恶劣环境但存在多边形效应和噪声；蜗杆可实现大传动比和特定条件下的自锁，但效率和发热需要关注。

## 齿轮设计基础

模数决定齿的基本尺寸和承载尺度，齿数比决定传动比。直齿轮结构简单但啮合冲击较明显，斜齿轮啮合平稳、承载高，却会产生轴向力。常见失效包括点蚀、胶合、磨损、齿根弯曲疲劳和断齿。

## 轴承选择

深沟球轴承适合径向载荷并可承受一定双向轴向载荷；圆柱滚子轴承径向承载高；角接触球轴承适合组合载荷并常成对使用；滑动轴承结构简单、耐冲击，但摩擦和润滑条件不同。

## 装配与寿命

- 旋转载荷一侧通常需要更可靠的过盈配合，固定载荷一侧可按工况选择较松配合。
- 安装力应作用在发生配合的套圈上，避免通过滚动体传递压装力。
- 预紧可提高刚度和旋转精度，但过大预紧会增加发热并缩短寿命。
- 轴肩、挡圈、螺母和端盖共同控制轴向定位，必须避免欠约束和重复过约束。
`,
      },
    ],
  },
  {
    id: 'npi',
    title: 'DFM 与 NPI',
    description: '从设计评审到试模、验证和量产。',
    pages: [{ id: 'npi-system', title: 'DFM、NPI 与可靠性闭环', summary: '在 EVT、DVT、PVT 和量产阶段逐步关闭风险。', level: '进阶', sources: ['《产品结构设计实例教程》：新产品开发流程'], content: legacyContent('dfm-npi-reliability') }],
  },
  {
    id: 'advanced',
    title: '热、EMC 与仿真',
    description: '产品级物理路径和验证方法。',
    pages: [{ id: 'advanced-system', title: '热设计、EMC 与结构仿真', summary: '从热路径、屏蔽路径和载荷路径理解系统问题。', level: '进阶', sources: ['参考资料/WB资料：电子产品热设计'], content: legacyContent('thermal-emc-advanced') }],
  },
  {
    id: 'industry',
    title: '行业专题',
    description: '把结构能力迁移到不同产品。',
    pages: [{ id: 'industry-system', title: '行业场景与能力迁移', summary: '连接器、服务器、消费电子、机器人与穿戴医疗。', level: '专题', sources: ['题库行业专项资料'], content: legacyContent('industry-specific') }],
  },
];

const sourcePages = sourceWikiSections.flatMap((section) => section.pages);
const sourcePage = (id) => sourcePages.find((page) => page.id === id);

const supplementPages = {
  software: {
    id: 'cad-software-stack',
    title: '三维、二维与辅助设计工具',
    summary: '按行业、协同和交付要求选择工具，而不是只比较建模命令。',
    level: '基础',
    sources: ['知识体系主线：第二模块 设计软件技能', '参考 1：三维设计工具高阶应用', '参考 2：底层工具层'],
    content: `
## 工具选择首先服从行业与协同

| 工具 | 高频场景 | 面试应说明的能力 |
|---|---|---|
| Creo/ProE | 消费电子、整机结构 | Top-Down、骨架模型、曲面、族表和工程图 |
| SolidWorks | 通用机械、设备与快速设计 | 零件装配、配置、工程图和基础仿真 |
| UG/NX | 汽车、模具与复杂加工 | 复杂曲面、模具协同、CAM 与装配管理 |
| CATIA | 汽车与航空 | 大型装配、曲面和跨专业数据协同 |
| AutoCAD | 二维工艺图与厂内沟通 | 图层、标注、版本和标准化输出 |

## 三维软件的核心能力

1. 从整机骨架控制关键包络、接口和堆叠尺寸。
2. 用参数化和配置管理系列化产品，控制父子关联风险。
3. 完成静态、动态和装配干涉检查。
4. 让 3D、2D、BOM 和 ECN 的版本保持一致。

## 辅助工具

- KeyShot 用于设计评审和外观表达，不替代工程验证。
- Illustrator 适合装配说明、丝印和标注整理。
- STEP/IGS 用于跨平台交换，转换后必须检查单位、曲面和基准。
`,
  },
  sheetMetalDiecast: {
    id: 'sheetmetal-diecast-rules',
    title: '钣金与压铸件设计规范',
    summary: '把折弯、冲压、压铆、壁厚和排气约束转化为检查清单。',
    level: '核心',
    sources: ['知识体系主线：4.2 钣金件设计规范、4.3 压铸件设计规范', '参考 1：钣金材料与冲压工艺、压铸与机加工工艺'],
    content: `
## 钣金件的五项检查

1. 折弯半径与材料、板厚和纹路方向匹配。
2. 孔到折弯边、孔到板边和孔间距满足模具工艺。
3. 压铆、翻边和攻牙有足够边距，并验证底孔与板材硬度。
4. 焊接位置可接近、可定位，并考虑热变形和表面处理。
5. 展开、折弯扣除与关键尺寸公差由同一基准体系控制。

## 压铸件的四项检查

- 壁厚尽量均匀，厚大截面用掏空与筋位替代。
- 沿开模方向设置拔模，避免深腔、尖角和困难侧抽。
- 让浇口、溢流和排气有合理布置空间。
- 对气孔、缩孔、冷隔和变形制定后加工与检验方案。

## 面试回答框架

先说材料与批量，再说成形方式和设计限制，最后说明缺陷风险、验证方法与成本影响。
`,
  },
  sealing: {
    id: 'sealing-waterproof-design',
    title: '密封与防水结构设计',
    summary: '从目标 IP 等级、密封路径、压缩量和公差链完成防护闭环。',
    level: '核心',
    sources: ['知识体系主线：4.4 密封防水设计', '参考 1：密封与防护设计'],
    content: `
## 先定义边界条件

防水设计必须先明确 IP 等级、压力与时间、温度范围、介质、拆装次数和寿命目标。不同目标决定 O 型圈、泡棉、点胶、迷宫或超声焊接的选择。

## 密封圈设计

- 由截面、沟槽、压缩量和材料硬度共同决定接触压力。
- 密封面要连续、平整并避开分型线、顶针和螺丝局部变形。
- 用公差链检查最差状态下仍有足够压缩，最大状态下不过压。
- 螺丝或卡扣沿密封路径均匀布置，控制壳体翘曲。

## 失效排查

按水迹定位漏点，再区分压缩不足、密封面不平、壳体变形、材料老化、点胶断线或焊接能量不足。修正后应复测环境老化与拆装寿命，而不是只过一次静态测试。
`,
  },
  costProduction: {
    id: 'cost-production-closure',
    title: '成本控制与量产问题闭环',
    summary: '用成本、良率、节拍和风险共同判断设计优化是否成立。',
    level: '进阶',
    sources: ['知识体系主线：5.3 成本控制、5.4 量产问题分析与解决', '参考 1：成本优化方法集、典型问题解决方案库'],
    content: `
## 成本优化的四条路径

1. 材料替换或减薄，但必须重新校核强度、耐温、阻燃和寿命。
2. 简化工艺、合并工序，避免为了单价牺牲良率与节拍。
3. 合并零件和功能，减少紧固件、装配动作与模具数量。
4. 标准化和平台化，让规格、模组和供应链跨项目复用。

## 量产问题闭环

使用“现象定义 → 数据分层 → 临时围堵 → 根因验证 → 永久措施 → 效果确认 → 标准化”的路径。注塑缩水、钣金回弹、装配干涉、异响和可靠性失效都应同时检查设计、材料、模具、工艺、量测与操作六个维度。

## 不能接受的降本

只比较材料单价、不计算良率和返工；取消验证；把关键尺寸放宽到影响功能；把风险转移给供应商但没有过程控制，这些都不属于有效工程优化。
`,
  },
  simulation: {
    id: 'simulation-analysis-path',
    title: '仿真与分析能力路线',
    summary: '覆盖静力、模态、热、跌落冲击和疲劳分析的输入与验证。',
    level: '进阶',
    sources: ['知识体系主线：第六模块 仿真与分析能力', '参考 1：仿真分析基础与应用'],
    content: `
## 仿真不是彩色云图

一次可信分析必须说明载荷、约束、材料模型、接触、网格、评价指标和实测校核。输入假设比软件按钮更重要。

| 分析类型 | 主要问题 | 结果关注点 |
|---|---|---|
| 静力学 | 会不会屈服或变形过大 | 应力、位移、反力与安全系数 |
| 模态与振动 | 是否接近激励频率 | 固有频率、振型与阻尼 |
| 热分析 | 热量能否排出 | 温度场、热流、接触热阻 |
| 跌落冲击 | 峰值载荷如何传递 | 加速度、应变能、接触与断裂位置 |
| 疲劳耐久 | 反复载荷何时失效 | 应力幅、循环次数与 S-N 曲线 |

## 验证原则

用手算或简化模型检查量级，用样机应变、位移、温度或模态测试校准边界。仿真给出趋势和风险位置，最终结论仍需实物验证。
`,
  },
  electronics: {
    id: 'electronic-cross-discipline',
    title: '电子堆叠与跨学科接口',
    summary: '处理 PCB、电池、散热、声学、光学和线缆与结构之间的接口。',
    level: '进阶',
    sources: ['知识体系主线：第七模块 电子与跨学科知识', '参考 1：整机堆叠与布局设计', '参考 2：行业专项知识'],
    content: `
## PCB 与器件堆叠

- 先锁定主板外形、禁布区、连接器操作空间和器件限高。
- 为 FPC、线缆和插拔动作保留路径、弯折半径与防磨结构。
- 发热器件与热敏器件分区，建立连续导热路径。

## 电池与电源结构

控制电芯膨胀空间、跌落限位、绝缘、防刺穿和排气路径。电池不应由尖锐筋位或螺丝直接承力。

## 声学与光学接口

音腔需要密封、容积和泄漏控制，麦克风要避免结构遮挡与振动串扰。导光柱和透镜要控制定位、间隙、杂散光与装配污染。

## 跨学科评审输出

用接口清单管理空间、载荷、热、EMC、声学、光学和装配边界，并为每个接口指定责任人和验证方法。
`,
  },
  compliance: {
    id: 'safety-reliability-system',
    title: '安规与可靠性验证体系',
    summary: '把认证条款、环境工况和失效模式转化为结构设计输入。',
    level: '进阶',
    sources: ['知识体系主线：第八模块 安规与可靠性', '参考 1：行业标准与安规认证、可靠性设计体系'],
    content: `
## 安规设计输入

根据产品市场和行业确认 CCC、CE、UL、FCC、FDA 或 ISO 13485 等要求。结构重点包括外壳防护、阻燃等级、爬电距离、电气间隙、危险部件防护和材料可追溯性。

## 可靠性测试矩阵

- 机械：跌落、冲击、振动、按键与插拔耐久。
- 环境：高低温、温循、湿热、盐雾、UV 与老化。
- 表面：耐磨、百格、RCA、汗液和化学介质。
- 防护：防尘、防水、泄压与密封寿命。

## 从测试回到设计

每个测试应对应使用工况、失效模式、判定标准和样本计划。失败后先保护现场与复现，再用断口、尺寸、材料、过程和载荷路径证据确认根因，避免直接加筋或换材料的经验式整改。
`,
  },
  career: {
    id: 'project-collaboration-career',
    title: '项目复盘、协作与职业进阶',
    summary: '用项目证据表达方案权衡、问题闭环和跨部门影响力。',
    level: '进阶',
    sources: ['知识体系主线：第九模块 项目管理与职业进阶', '参考 1：项目实战沉淀层', '参考 2：软实力与英文能力'],
    content: `
## 一份可面试的项目复盘

1. 产品目标、个人职责和硬性约束。
2. 两到三套方案及成本、工艺、可靠性、周期对比。
3. 最难的问题、根因分析、验证数据和最终结果。
4. 量化成果：成本、良率、可靠性、周期或专利。
5. 遗留风险、后续改进和可复用模块。

## 跨部门协作

与 ID 对齐外观与工艺边界，与硬件对齐 PCB、连接器、热和 EMC 接口，与模具厂对齐分型、进胶、顶出和试模，与品质和产线对齐 CTQ、量测、工装和良率。

## 职业进阶

技术专家路线强调方法、标准和疑难问题；项目管理路线强调资源、风险与交付；产品路线强调用户、商业和跨专业决策。无论选择哪条路线，都要保留可审查的工程证据和清晰的专业表达。
`,
  },
};

const frameworkPage = ({ id, title, summary, topics = [], base, children = [], level = '核心' }) => {
  const basePage = typeof base === 'string' ? sourcePage(base) : base;
  const topicContent = topics.length
    ? `## 主线知识点\n\n${topics.map((topic) => `- **${topic}**`).join('\n')}`
    : '';
  const detailContent = basePage?.content
    ? `\n\n## 深入学习\n\n${basePage.content.trim()}`
    : '';

  return {
    id,
    title,
    summary,
    level,
    sources: [
      '《结构面试知识体系主要.md》',
      ...(basePage?.sources || []),
      '《结构面试知识体系参考1》与《结构面试知识体系参考2》用于内容补充',
    ],
    content: `${topicContent}${detailContent}`,
    children,
  };
};

export const wikiSections = [
  {
    id: 'foundation-theory',
    title: '第一模块：基础理论',
    description: '工程表达、力学、材料和公差构成产品结构设计的专业底座。',
    pages: [
      frameworkPage({ id: 'engineering-drawing', title: '1.1 机械制图与工程图学', summary: '掌握视图表达、尺寸标注、技术要求与图纸规范。', topics: ['三视图、剖视图与断面图', '尺寸标注与技术要求', '粗糙度、基准和工程图规范', '图纸编号、标题栏与版本管理'], base: 'drawing-measurement-basics' }),
      frameworkPage({ id: 'material-mechanics', title: '1.2 材料力学基础', summary: '建立受力、强度、刚度、疲劳与冲击的分析框架。', topics: ['静力学平衡与约束反力', '拉压、弯曲与扭转', '应力集中与刚度校核', '疲劳、冲击与振动基础'], base: 'mechanics-strength' }),
      frameworkPage({ id: 'engineering-materials', title: '1.3 工程材料学', summary: '理解材料性能参数、失效机制和工程选型逻辑。', topics: ['强度、刚度、韧性与硬度', '耐温、吸水、收缩与蠕变', '塑料、金属、弹性体与复合材料', '工况、工艺、成本与验证'], base: 'materials-properties' }),
      frameworkPage({ id: 'tolerance-measurement', title: '1.4 公差配合与测量技术', summary: '用尺寸链、配合、GD&T 和量测保证功能一致性。', topics: ['尺寸公差与 IT 等级', '间隙、过渡和过盈配合', '尺寸链与公差分配', 'GD&T、基准与测量方法'], base: 'tolerance-system' }),
    ],
  },
  {
    id: 'design-software',
    title: '第二模块：设计软件技能',
    description: '按行业与交付场景掌握三维、二维和辅助设计工具。',
    pages: [
      frameworkPage({ id: 'three-dimensional-software', title: '2.1 三维设计软件', summary: '掌握主流三维平台的行业定位与核心工作流。', topics: ['Creo/ProE（消费电子首选）', 'SolidWorks（入门友好）', 'UG/NX（汽车/模具）', 'CATIA（汽车/航空）'], base: supplementPages.software }),
      frameworkPage({ id: 'two-dimensional-software', title: '2.2 二维绘图软件', summary: '使用 AutoCAD 完成二维工艺表达和标准化交付。', topics: ['AutoCAD', '图层、线型与标注规范', '加工图与装配图表达', '版本与转档检查'], base: 'drawing-measurement-basics' }),
      frameworkPage({ id: 'auxiliary-design-tools', title: '2.3 辅助设计工具', summary: '用渲染和标注工具提升评审与沟通效率。', topics: ['KeyShot（渲染）', 'Adobe Illustrator（标注）', '装配说明与评审输出', '辅助工具与工程数据边界'], base: supplementPages.software }),
    ],
  },
  {
    id: 'materials-process',
    title: '第三模块：材料与工艺知识',
    description: '从材料特性、模具、表面处理到连接装配建立制造知识骨架。',
    pages: [
      frameworkPage({ id: 'plastic-materials', title: '3.1 塑胶材料', summary: '从高分子本质出发，系统掌握材料分类、性能、改性、成型、选型和验证。', topics: ['通用塑料（ABS/PP/PS）', '工程塑料（PC/PA/POM/PBT）', '特种塑料（PEEK/LCP/PPS）', '弹性体（TPE/TPU/硅胶）'], base: plasticMaterialsOverview, children: plasticMaterialCoursePages }),
      frameworkPage({ id: 'metal-materials', title: '3.2 金属材料', summary: '比较常用金属牌号、制造适配性和表面性能。', topics: ['铝合金（6061/6063/压铸铝）', '不锈钢（304/316）', '冷轧板/SPCC', '铜合金/钛合金'], base: 'aluminum-steel' }),
      frameworkPage({ id: 'mold-process', title: '3.3 模具工艺', summary: '理解不同成型模具的结构、限制与缺陷来源。', topics: ['注塑模具（分型线/浇口/顶针/滑块）', '五金冲压模具', '压铸模具', '挤出模具'], base: 'injection-system' }),
      frameworkPage({ id: 'surface-treatment-process', title: '3.4 表面处理工艺', summary: '结合材料、外观、耐久和尺寸影响选择表面工艺。', topics: ['喷涂（喷漆/UV/PU）', '电镀（水电镀/真空镀/NCVM）', 'IML/IMD/水转印', '阳极氧化/拉丝/喷砂', '镭雕/丝印'], base: 'surface-system' }),
      frameworkPage({ id: 'connection-assembly-process', title: '3.5 连接与装配工艺', summary: '比较可拆、半永久和永久连接的适用边界。', topics: ['卡扣设计', '螺丝连接', '超声焊接', '胶粘/双面胶', '铰链/转轴'], base: 'assembly-system' }),
    ],
  },
  {
    id: 'structure-rules',
    title: '第四模块：结构设计规范',
    description: '把塑胶、钣金、压铸和密封的制造约束转化为设计规则。',
    pages: [
      frameworkPage({ id: 'plastic-part-rules', title: '4.1 塑胶件设计规范', summary: '建立壁厚、筋、柱、脱模和缺陷预防的系统规则。', topics: ['壁厚设计（1.5-2.5mm）', '加强筋与凸台', '脱模斜度（1°-3°）', '圆角过渡', '卡扣与螺丝柱', '避免常见缺陷（缩水/熔接痕/变形）'], base: 'plastic-design-system' }),
      frameworkPage({ id: 'sheetmetal-part-rules', title: '4.2 钣金件设计规范', summary: '围绕冲裁、折弯、压铆和焊接控制结构工艺性。', topics: ['折弯系数与最小折弯半径', '孔位间距与边距', '压铆与翻边', '焊接设计', '加强筋与凸包'], base: supplementPages.sheetMetalDiecast }),
      frameworkPage({ id: 'diecast-part-rules', title: '4.3 压铸件设计规范', summary: '控制壁厚、拔模、进胶排气和内部缺陷风险。', topics: ['壁厚均匀性', '拔模斜度', '浇口与排气', '避免气孔与缩孔'], base: supplementPages.sheetMetalDiecast }),
      frameworkPage({ id: 'sealing-waterproof-rules', title: '4.4 密封防水设计', summary: '从 IP 目标、密封路径和公差链完成防水闭环。', topics: ['IP防护等级', '硅胶圈密封', '超声波焊接密封', '点胶密封'], base: supplementPages.sealing }),
    ],
  },
  {
    id: 'dfm-mass-production',
    title: '第五模块：DFM/DFA与量产知识',
    description: '面向制造、装配、成本和量产问题建立完整闭环。',
    pages: [
      frameworkPage({ id: 'design-for-manufacturing', title: '5.1 面向制造的设计（DFM）', summary: '在设计阶段识别注塑、钣金和压铸制造风险。', topics: ['注塑DFM', '钣金DFM', '压铸DFM'], base: 'npi-system' }),
      frameworkPage({ id: 'design-for-assembly', title: '5.2 面向装配的设计（DFA）', summary: '减少零件和动作，用防呆与模块化提升装配效率。', topics: ['零件数量最小化', '装配方向唯一化', '防呆设计', '标准化与模块化'], base: 'assembly-system' }),
      frameworkPage({ id: 'cost-control', title: '5.3 成本控制', summary: '从材料、模具和加工三个维度做可验证的降本。', topics: ['材料成本优化', '模具成本优化', '加工成本优化'], base: supplementPages.costProduction }),
      frameworkPage({ id: 'mass-production-problem-solving', title: '5.4 量产问题分析与解决', summary: '用数据、根因验证和标准化关闭试模与量产问题。', topics: ['试模问题（缩水/变形/熔接痕）', '装配问题（干涉/松动/异响）', '可靠性问题（断裂/失效/老化）'], base: supplementPages.costProduction }),
    ],
  },
  {
    id: 'simulation-analysis',
    title: '第六模块：仿真与分析能力',
    description: '以可信边界条件和实测校核支撑结构、振动、热与寿命判断。',
    pages: [
      frameworkPage({ id: 'static-structural-analysis', title: '6.1 结构静力学分析', summary: '判断载荷下的应力、变形、反力和安全系数。', topics: ['材料与截面参数', '约束和载荷定义', '强度与刚度结果', '应力集中与实测校核'], base: supplementPages.simulation }),
      frameworkPage({ id: 'modal-vibration-analysis', title: '6.2 模态与振动分析', summary: '识别固有频率、振型、共振和减振方向。', topics: ['固有频率与振型', '激励频率和共振风险', '阻尼、隔振与结构优化', '模态试验校准'], base: supplementPages.simulation }),
      frameworkPage({ id: 'thermal-analysis-design', title: '6.3 热分析与散热设计', summary: '建立热源、热阻、导热路径和温升验证模型。', topics: ['热传导、对流与辐射', '热阻与接触热阻', '自然散热与强制风冷', '温度场与实测校核'], base: 'advanced-system' }),
      frameworkPage({ id: 'drop-impact-analysis', title: '6.4 跌落与冲击分析', summary: '分析跌落姿态、载荷路径、缓冲与断裂风险。', topics: ['跌落工况和姿态', '冲击载荷与接触', '器件固定与边角防护', '断裂位置和试验相关性'], base: supplementPages.simulation }),
      frameworkPage({ id: 'fatigue-durability-analysis', title: '6.5 疲劳与耐久分析', summary: '评估交变载荷、循环寿命和耐久失效。', topics: ['交变载荷与应力幅', 'S-N 曲线和疲劳强度', '应力集中与表面影响', '寿命试验与失效判定'], base: supplementPages.simulation }),
    ],
  },
  {
    id: 'cross-discipline',
    title: '第七模块：电子与跨学科知识',
    description: '管理 PCB、电池、热、声学和光学与结构之间的接口。',
    pages: [
      frameworkPage({ id: 'pcb-layout-height', title: '7.1 PCB布局与限高', summary: '控制主板包络、器件限高、连接器和走线空间。', topics: ['PCB外形和固定', '器件限高与禁布区', '连接器操作空间', 'FPC与线缆弯折半径'], base: supplementPages.electronics }),
      frameworkPage({ id: 'battery-power-structure', title: '7.2 电池与电源结构', summary: '处理电芯固定、膨胀、绝缘、防刺穿和安全泄压。', topics: ['电芯包络与膨胀空间', '跌落限位和缓冲', '绝缘与防刺穿', '排气和热失控边界'], base: supplementPages.electronics }),
      frameworkPage({ id: 'thermal-conduction-design', title: '7.3 散热与导热设计', summary: '从器件布局到导热材料和风道建立连续热路径。', topics: ['热源与热敏器件分区', '导热硅胶片、硅脂和石墨', '散热片与风道', '温升测试和热界面公差'], base: 'advanced-system' }),
      frameworkPage({ id: 'acoustic-structure', title: '7.4 声学结构（音腔/麦克风）', summary: '控制音腔容积、密封、泄漏和麦克风串扰。', topics: ['前后音腔与有效容积', '声学密封和泄漏', '喇叭固定与防振', '麦克风孔和结构串扰'], base: supplementPages.electronics }),
      frameworkPage({ id: 'optical-structure', title: '7.5 光学结构（导光/透镜）', summary: '控制光路、定位、间隙、杂散光和装配洁净度。', topics: ['导光柱和透镜定位', '光源距离与耦合', '遮光和杂散光控制', '装配污染与外观验证'], base: supplementPages.electronics }),
    ],
  },
  {
    id: 'safety-reliability',
    title: '第八模块：安规与可靠性',
    description: '把认证条款、可靠性工况与绝缘防火要求转化为设计输入。',
    pages: [
      frameworkPage({ id: 'safety-standards', title: '8.1 安规标准', summary: '识别不同市场和行业的结构相关认证要求。', topics: ['CCC认证', 'UL/CE认证', 'FDA/ISO 13485（医疗器械）'], base: supplementPages.compliance }),
      frameworkPage({ id: 'reliability-testing', title: '8.2 可靠性测试', summary: '建立机械、环境、表面与防护测试矩阵。', topics: ['跌落测试', '振动测试', '高低温测试', '耐磨/老化测试', '盐雾/防水测试'], base: 'material-validation' }),
      frameworkPage({ id: 'fire-insulation-design', title: '8.3 防火与绝缘设计', summary: '控制阻燃、爬电距离、电气间隙和危险部件防护。', topics: ['材料阻燃等级', '爬电距离与电气间隙', '绝缘隔离与接地', '危险运动和高温部件防护'], base: supplementPages.compliance }),
    ],
  },
  {
    id: 'project-career',
    title: '第九模块：项目管理与职业进阶',
    description: '从产品流程、协作、拆解和技术文档走向完整职业能力。',
    pages: [
      frameworkPage({ id: 'product-development-process', title: '9.1 产品开发流程', summary: '理解从概念到量产导入各阶段的结构职责与输出。', topics: ['概念设计', '详细设计', '手板验证', '模具开发', '试产验证', '量产导入'], base: 'npi-system' }),
      frameworkPage({ id: 'cross-functional-collaboration', title: '9.2 跨部门协作', summary: '管理外观、硬件、模具、工厂和品质之间的接口。', topics: ['与ID设计师协作', '与硬件工程师协作', '与模具厂协作', '与工厂/品质协作'], base: supplementPages.career }),
      frameworkPage({ id: 'competitive-teardown', title: '9.3 竞品拆解分析', summary: '从架构、材料、工艺、成本和可靠性提炼可复用结论。', topics: ['拆解目标和样品记录', '堆叠、连接与装配顺序', '材料工艺与成本推断', '优缺点、风险与可复用方案'], base: 'knowledge-network' }),
      frameworkPage({ id: 'technical-documentation', title: '9.4 技术文档撰写', summary: '用图纸、BOM、ECN、评审和验证报告传递设计意图。', topics: ['2D图纸与技术要求', 'BOM与物料编码', 'ECR/ECN变更文件', 'DFM、试产与验证报告'], base: 'cad-bom-change' }),
      frameworkPage({ id: 'career-development', title: '9.5 职业规划与发展', summary: '根据能力优势选择技术、项目或产品发展路线。', topics: ['技术专家路线', '项目管理路线', '产品经理路线'], base: supplementPages.career }),
    ],
  },
];

export const wikiPages = wikiSections.flatMap((section) =>
  section.pages.flatMap((page) => {
    const parent = { ...page, sectionId: section.id, sectionTitle: section.title };
    const children = (page.children || []).map((child) => ({
      ...child,
      sectionId: section.id,
      sectionTitle: section.title,
      parentId: page.id,
      parentTitle: page.title,
    }));
    return [parent, ...children];
  })
);

const legacyTopicMap = {
  'zero-to-one-roadmap': 'product-development-process',
  'role-and-product-loop': 'product-development-process',
  'materials-start': 'engineering-materials',
  'common-plastics': 'plastic-materials',
  'material-selection-core': 'engineering-materials',
  'plastic-part-design': 'plastic-part-rules',
  'plastic-design-system': 'plastic-part-rules',
  'injection-mold-process': 'mold-process',
  'injection-system': 'mold-process',
  'metal-processes': 'sheetmetal-part-rules',
  'metal-process-system': 'sheetmetal-part-rules',
  'assembly-dfa': 'design-for-assembly',
  'assembly-system': 'design-for-assembly',
  'tolerance-gdt': 'tolerance-measurement',
  'tolerance-system': 'tolerance-measurement',
  'surface-finishing': 'surface-treatment-process',
  'surface-system': 'surface-treatment-process',
  'dfm-npi-reliability': 'design-for-manufacturing',
  'npi-system': 'product-development-process',
  'thermal-emc-advanced': 'thermal-analysis-design',
  'advanced-system': 'thermal-analysis-design',
  'industry-specific': 'pcb-layout-height',
  'industry-system': 'pcb-layout-height',
};

export function findWikiPage(knowledgeId = '', category = '') {
  const id = knowledgeId.toLowerCase();

  if (category.includes('钣金')) return wikiPages.find((page) => page.id === 'sheetmetal-part-rules');
  if (category.includes('压铸')) return wikiPages.find((page) => page.id === 'diecast-part-rules');
  if (category.includes('CNC') || category.includes('型材')) return wikiPages.find((page) => page.id === 'metal-materials');
  if (category.includes('PCB')) return wikiPages.find((page) => page.id === 'pcb-layout-height');
  if (category.includes('电池')) return wikiPages.find((page) => page.id === 'battery-power-structure');
  if (category.includes('声学')) return wikiPages.find((page) => page.id === 'acoustic-structure');
  if (category.includes('光学')) return wikiPages.find((page) => page.id === 'optical-structure');
  if (category.includes('安全') || category.includes('合规') || category.includes('安规')) return wikiPages.find((page) => page.id === 'safety-standards');
  if (category.includes('公差') || category.includes('GD')) return wikiPages.find((page) => page.id === 'tolerance-measurement');
  if (category.includes('图纸') || category.includes('CAD')) return wikiPages.find((page) => page.id === 'engineering-drawing');
  if (category.includes('注塑工艺') || category.includes('模具') || category.includes('塑胶缺陷')) return wikiPages.find((page) => page.id === 'mold-process');
  if (category.includes('塑胶结构') || category.includes('结构件设计')) return wikiPages.find((page) => page.id === 'plastic-part-rules');
  if (category.includes('密封') || category.includes('防水')) return wikiPages.find((page) => page.id === 'sealing-waterproof-rules');
  if (category.includes('装配') || category.includes('螺纹') || category.includes('紧固')) return wikiPages.find((page) => page.id === 'design-for-assembly');
  if (category.includes('表面') || category.includes('电镀') || category.includes('涂层')) return wikiPages.find((page) => page.id === 'surface-treatment-process');
  if (category.includes('热设计') || category.includes('热管理')) return wikiPages.find((page) => page.id === 'thermal-analysis-design');
  if (category.includes('EMC')) return wikiPages.find((page) => page.id === 'pcb-layout-height');
  if (category.includes('FEA') || category.includes('仿真')) return wikiPages.find((page) => page.id === 'static-structural-analysis');
  if (category.includes('可靠性')) return wikiPages.find((page) => page.id === 'reliability-testing');
  if (category.includes('NPI') || category.includes('开发')) return wikiPages.find((page) => page.id === 'product-development-process');
  if (category.includes('DFM')) return wikiPages.find((page) => page.id === 'design-for-manufacturing');
  if (category.includes('DFMEA') || category.includes('DOE') || category.includes('8D')) return wikiPages.find((page) => page.id === 'mass-production-problem-solving');
  if (category.includes('BOM') || category.includes('ECN') || category.includes('技术文档')) return wikiPages.find((page) => page.id === 'technical-documentation');
  if (category.includes('齿轮') || category.includes('轴承') || category.includes('传动') || category.includes('轴系')) return wikiPages.find((page) => page.id === 'material-mechanics');
  if (category.includes('力学') || category.includes('强度') || category.includes('机械通用基础')) return wikiPages.find((page) => page.id === 'material-mechanics');
  if (category.includes('缺陷分析')) return wikiPages.find((page) => page.id === 'mass-production-problem-solving');
  if (category.includes('结构设计原则')) return wikiPages.find((page) => page.id === 'design-for-assembly');
  if (category.includes('行业') || category.includes('通信') || category.includes('连接器') || category.includes('机器人')) return wikiPages.find((page) => page.id === 'pcb-layout-height');

  if (/(aluminum|al5052|al6061|steel|stainless|spcc|sgcc|sus|copper|metal)/.test(id)) return wikiPages.find((page) => page.id === 'metal-materials');
  if (/(silicone|tpu|tpe|rubber)/.test(id)) return wikiPages.find((page) => page.id === 'plastic-materials');
  if (/(oring|adhesive|vhb|gasket)/.test(id)) return wikiPages.find((page) => page.id === 'sealing-waterproof-rules');
  if (/(abs|pc|pom|pa6|pa66|polyamide|polycarbonate|pp-|pmma|pbt|pet|pps|peek|pei|lcp|plastic)/.test(id)) return wikiPages.find((page) => page.id === 'plastic-materials');
  if (/(density|strength|modulus|impact|hdt|tg|shrinkage|absorption|creep)/.test(id)) return wikiPages.find((page) => page.id === 'engineering-materials');
  if (/(thermal|heat|fan|tim|graphite|heat-pipe)/.test(id)) return wikiPages.find((page) => page.id === 'thermal-analysis-design');
  if (/(ul94|rohs|reach|weather|fatigue)/.test(id)) return wikiPages.find((page) => page.id === 'reliability-testing');
  if (category.includes('材料') || category.includes('性能')) return wikiPages.find((page) => page.id === 'engineering-materials');

  return wikiPages[0];
}

export function resolveWikiPage(topic = '', point = '', category = '') {
  const direct = wikiPages.find((page) => page.id === topic);
  if (direct) return direct;
  if (point || category) return findWikiPage(point, category);
  const mappedId = legacyTopicMap[topic];
  return wikiPages.find((page) => page.id === mappedId) || wikiPages[0];
}

export function getWikiHref(knowledgeId = '', category = '') {
  const page = findWikiPage(knowledgeId, category);
  const point = knowledgeId ? `&point=${encodeURIComponent(knowledgeId)}` : '';
  return `/kb?topic=${encodeURIComponent(page.id)}${point}`;
}

export default wikiSections;
