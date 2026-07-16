export const knowledgeArticles = [
  {
    id: 'material-selection-core',
    category: '01 材料认知',
    title: '结构材料选型：先看工况，再看工艺和成本',
    summary: '把塑胶、金属、弹性体和辅材放在同一张选型逻辑里，避免只背材料牌号。',
    keywords: ['material', 'plastic', 'abs', 'pc', 'pa', 'pom', 'pbt', 'pet', 'pps', 'peek', 'pei', 'lcp', 'pp', 'pmma', 'gf', 'cf', 'rohs', 'reach', 'ul94', 'fr', 'density', 'thermal', 'wear', '透明', '阻燃', '材料与性能', '塑胶材料', '材料学'],
    content: `
## 为什么材料选型不能只背 ABS、PC、POM

结构工程师选材料，本质是在 **功能、成型、可靠性、成本、供应链** 之间做取舍。面试里如果只回答“PC 强度高、ABS 易加工、POM 耐磨”，通常不够。更好的回答方式是先定义工况：

- 受力：静载、冲击、疲劳、螺丝锁附、卡扣反复拆装。
- 温度：常温、持续高温、冷热冲击、热源附近温升。
- 环境：水汽、汗液、油污、紫外、盐雾、清洁剂。
- 外观：透明、喷涂、电镀、咬花、手感、耐刮。
- 工艺：注塑流动性、收缩率、吸水率、尺寸稳定性、是否需烘料。
- 合规：RoHS、REACH、食品接触、阻燃等级、医疗或出口安规。

### 常用塑胶的工程理解

| 材料 | 优势 | 风险 | 典型结构用途 |
|---|---|---|---|
| ABS | 易注塑、外观好、成本低、可电镀 | 耐热和耐候一般 | 普通外壳、面板、装饰件 |
| PC | 冲击强、透明、耐热较好 | 应力开裂、熔体粘度高、厚透明件易缺陷 | 透明罩、防护件、高冲击壳体 |
| PC+ABS | 兼顾韧性、耐热、外观和加工 | 比 ABS 贵，耐化学需验证 | 3C 外壳、结构壳体 |
| PA6/PA66 | 强度好、耐磨、耐疲劳 | 吸水导致尺寸和刚性变化 | 齿轮、支架、受力件 |
| POM | 耐磨、自润滑、尺寸稳定 | 酸和高温分解风险，阻燃难 | 齿轮、滑块、轴套 |
| PP | 密度低、耐化学、铰链性能好 | 刚性和低温冲击较弱，表面处理难 | 容器、活铰、低成本壳体 |
| PBT/PET | 电性能、耐热、尺寸稳定 | 结晶收缩，需控制翘曲 | 连接器、电子电器壳体 |
| LCP/PPS/PEEK/PEI | 高温、高强、电性能或耐化学突出 | 成本高、加工窗口窄 | 连接器、服务器、医疗高端件 |

### 玻纤增强不是“无脑变强”

玻纤会提高拉伸强度、热变形温度和尺寸稳定性，但也会带来各向异性、浮纤、熔接线强度下降、模具磨损和翘曲方向性。薄壁壳体、卡扣和外观面如果用 GF 材料，要同时检查：

- 纤维流向是否导致不同方向收缩不一致。
- 卡扣根部是否因材料变脆而降低疲劳寿命。
- 外观面是否出现浮纤、流痕或喷涂遮盖不足。
- 螺丝柱是否因高刚性低韧性而开裂。

### 面试答题模板

遇到材料题，可以按这四步回答：

1. 先说工况：受力、温度、环境、外观、法规。
2. 再选材料族：普通外壳 ABS/PC+ABS，耐磨 POM/PA，透明 PC/PMMA，耐热 PBT/PPS/PEI/PEEK。
3. 再说工艺风险：收缩率、吸水、烘料、壁厚、表面处理、模具磨损。
4. 最后说验证：跌落、热老化、化学品、阻燃、尺寸稳定、装配耐久。

### 设计检查清单

- 材料牌号是否有真实供应商数据表，而不是只写“ABS”？
- 是否验证了最差温度下的韧性、蠕变和装配力？
- 吸水材料是否考虑装配间隙和尺寸变化？
- 阻燃材料是否影响强度、流动、颜色和成本？
- 食品、医疗、出口产品是否确认了法规等级？
`,
  },
  {
    id: 'plastic-part-design',
    category: '02 塑胶结构',
    title: '塑胶件结构设计：壁厚、筋、柱、卡扣和脱模是一套系统',
    summary: '从注塑成型约束解释常见结构规则，避免把经验值背成孤立结论。',
    keywords: ['wall', 'rib', 'boss', 'snap', 'draft', 'fillet', 'sink', 'gate', 'ejector', 'tongue', 'groove', 'ultrasonic', 'weld', '塑胶结构', '壁厚', '加强筋', '螺丝柱', '卡扣', '止口', '拔模', '脱模', '缩水'],
    content: `
## 塑胶结构设计的核心矛盾

塑胶件要同时满足外观、强度、装配和成型。很多设计规则都来自同一个底层原因：**塑料从熔体变成固体时会冷却收缩，厚处冷却慢，薄处冷却快，收缩不均就会造成缩水、翘曲、内应力和尺寸漂移。**

### 壁厚：均匀优先，局部强度用截面解决

均匀壁厚不是为了好看，而是为了让熔体流动、保压和冷却更可控。厚壁会带来缩水、气泡、冷却周期长；薄壁会带来填充困难、短射、强度不足。

- 常见 3C 外壳通常在 1.2-2.5mm 范围内选取，具体要看材料、尺寸和外观要求。
- 相邻壁厚突变应做圆角或缓坡过渡。
- 外观面背后尽量避免柱、厚筋、厚搭接直接堆胶。
- 需要刚性时优先用筋、翻边、盒形截面，而不是整体加厚。

### 加强筋：不是越厚越强

加强筋用来提高截面惯性矩，但筋太厚会在外观面形成缩水。常见经验是筋厚取主体壁厚的 0.4-0.7 倍；外观要求高时宁可取低值并增加筋数量。

筋设计要点：

- 根部加 R，但不能大到形成厚胶。
- 筋高过高时容易填充不足和变形，优先多条低筋替代单条高筋。
- 多筋交叉处要减胶、错位或开槽，避免材料堆积。
- 筋也要有拔模斜度，尤其是深筋和咬花面。

### 螺丝柱：强度、缩水、开裂要一起看

螺丝柱是最容易出问题的塑胶结构之一。柱太厚会缩水，太薄会爆柱；根部无支撑会被锁螺丝扭矩撕裂。

设计原则：

- 自攻螺丝柱必须有中心孔，不能做实心柱。
- 柱外径、孔径和锁附深度要按螺丝规格和材料韧性确定。
- 柱根用 2-4 条支撑筋连接到底壳或侧壁。
- 柱根和筋根都要有圆角，但避免厚胶。
- 热熔铜螺母要预留导向、包胶肉厚和溢胶空间。

### 卡扣与止口：定位和锁紧不要混在一起

一个成熟的上下壳结构，通常由止口/定位柱负责 X/Y 定位，螺丝/卡扣负责 Z 向锁紧，限位筋负责防晃和防错。不要让一个卡扣同时承担定位、承力、防松和拆卸功能。

卡扣设计重点：

- 根部圆角是寿命关键。
- 卡扣需要装配导入角和保持角，拆卸件还要有工具位。
- 卡扣材料要有足够韧性，POM/PA/PP 通常优于脆性材料。
- 多次拆装件要按应变和疲劳校核，不只看一次装配能否扣上。

### 拔模和倒扣：开模方向要在结构早期确定

所有沿脱模方向的侧壁、筋、柱、卡扣都应考虑拔模。蚀纹面、深腔、内壁通常需要更大拔模角。倒扣结构会引入滑块、斜顶或强脱，直接影响模具成本、寿命和试模风险。

### 开模前检查清单

- 壁厚是否均匀，外观面背后是否有厚胶？
- 筋厚、筋高、筋交叉是否会缩水或困气？
- 螺丝柱是否有中心孔、支撑筋、根部 R 和足够锁附深度？
- 卡扣是否有弹性行程、导入角、保持角和拆卸路径？
- 止口、定位柱、限位筋和锁紧件职责是否清楚？
- 所有垂直面是否有拔模，倒扣是否必须？
- 浇口、熔接线、顶针位是否避开外观和高应力区？
`,
  },
  {
    id: 'injection-mold-process',
    category: '03 成型与缺陷',
    title: '注塑与模具：把缺陷反推到结构、模具和参数',
    summary: '用“材料-结构-模具-工艺”四层框架分析缩水、翘曲、熔接线、披锋和银纹。',
    keywords: ['molding', 'injection', 'mold', 'runner', 'hot-runner', 'cooling', 'vent', 'slider', 'lifter', 'warpage', 'weld-line', 'flash', 'silver', 'burn', 'gate', 'holding', '注塑', '模具', '浇口', '排气', '冷却', '滑块', '斜顶', '翘曲', '熔接线', '披锋', '银纹'],
    content: `
## 缺陷分析不要只调参数

注塑缺陷通常不是单一原因。正确分析顺序是：材料是否合适并充分干燥，结构是否造成厚薄突变，模具浇口/排气/冷却是否合理，最后才是注塑参数。

### 常见缺陷的工程逻辑

| 缺陷 | 常见现象 | 结构原因 | 模具/工艺原因 | 优先对策 |
|---|---|---|---|---|
| 缩水 | 外观面凹陷 | 背面厚柱、厚筋、局部厚胶 | 保压不足、冷却不足 | 减胶、筋柱减薄、浇口/保压优化 |
| 翘曲 | 零件变形、装配不平 | 壁厚不均、筋单侧布置、玻纤方向 | 冷却不均、脱模应力 | 均壁厚、对称筋、优化冷却和浇口 |
| 熔接线 | 两股料流汇合线 | 孔洞/筋位切分流动路径 | 料温低、排气差、浇口位置差 | 避开受力区，调整浇口和排气 |
| 披锋 | 分型面或顶针处毛边 | 配合面薄弱、投影面积大 | 锁模力不足、模具磨损 | 降压、修模、提高合模刚性 |
| 银纹/气花 | 表面银白条纹 | 流动路径突变 | 水分、挥发物、剪切过热 | 烘料、降剪切、优化排气 |

### 模具结构要点

- 分型线优先放在外观不敏感、易加工、易抛光的位置。
- 滑块解决侧向倒扣，但会增加模具尺寸、成本和披锋风险。
- 斜顶适合内部倒扣，设计时要检查行程、强度和顶出空间。
- 排气槽不是越深越好，要防止披锋；不同材料允许深度不同。
- 冷却水路要尽量均匀接近型腔，冷却不均是翘曲的重要来源。

### 试模问题记录方式

试模不是“看到问题再改图”，而是验证设计假设。建议每次试模记录：

1. 材料牌号、批次、烘料条件。
2. 机台吨位、模温、料温、注射速度、保压、冷却时间。
3. 缺陷位置、方向、是否随参数变化。
4. 尺寸报告和外观照片。
5. 判断属于结构、模具还是工艺问题，并给出责任闭环。

### 面试高频回答

问“翘曲怎么解决”时，不要只说“调模温”。更完整的回答是：先看壁厚和筋位是否对称，再看材料收缩和玻纤流向，再看浇口位置和保压路径，再看冷却水路是否均匀，最后通过模流、试模 DOE 和尺寸实测验证。
`,
  },
  {
    id: 'metal-processes',
    category: '04 金属工艺',
    title: '钣金、压铸、CNC 与型材：按量产方式理解结构约束',
    summary: '把金属件按成形逻辑拆开看：板材弯出来、熔融合出来、刀具切出来、型材挤出来。',
    keywords: ['sheet', 'bend', 'k-factor', 'spcc', 'secc', 'sgcc', 'sus', 'al5052', 'diecast', 'adc12', 'cnc', '6061', '7075', 'extrusion', 'tongue', 'profile', '压铸', '钣金', '折弯', '冲压', 'CNC', '型材', '挤压', '阳极', '铝合金'],
    content: `
## 四类金属工艺的底层差异

钣金是板材分离和弯曲，压铸是熔融金属高速充型，CNC 是刀具切削，型材是金属通过模孔挤压成连续截面。工艺不同，结构限制完全不同。

### 钣金：折弯线决定设计边界

钣金件特点是厚度基本一致，设计重点是折弯半径、孔边距、展开、压铆和焊接变形。

- 内折弯半径通常不宜小于材料厚度的 0.5-1 倍，铝和不锈钢要更保守。
- 孔到折弯线太近会拉裂或变形，常按 1.5t+R 以上做初步判断。
- 折弯方向要考虑材料轧制方向，铝材尤其要避免沿不利方向开裂。
- 压铆螺母、翻边攻牙、沉头孔要考虑板厚和安装方向。
- 尖角不仅刮手，也会降低冲裁模寿命，外内角都应圆角过渡。

### 压铸：流动、排气和后加工决定质量

压铸适合复杂金属外壳和中大批量零件，但内部气孔、缩孔、热裂和飞边是核心风险。

- 壁厚尽量均匀，避免大厚壁孤岛。
- 深腔和内壁需要脱模斜度，内表面通常比外表面更大。
- 关键密封面、螺纹孔、轴承位通常需要 CNC 后加工。
- 高气密和高强度件要评估真空压铸、局部挤压或后处理方案。
- ADC12 常用于铝压铸，但不适合所有高强焊接场景。

### CNC：刀具进得去，比模型画得出来更重要

CNC 设计要考虑刀具半径、装夹次数、薄壁变形、深孔长径比和加工基准。

- 内角不可能加工成绝对尖角，内 R 至少要大于刀具半径。
- 薄壁件易振刀和变形，需要留加工余量或优化装夹。
- 深腔、深孔、窄槽会显著增加加工成本。
- 公差越紧，装夹、检测和报废成本越高。

### 型材：截面先行，二次加工补细节

铝型材适合长条结构、散热片、导轨和框架。设计重点是截面均匀、舌比、壁厚、模具寿命和二次加工。

### 快速选型判断

- 低成本薄板外壳：优先钣金。
- 复杂金属壳体且批量大：考虑压铸。
- 小批量高精度或外观金属件：考虑 CNC。
- 长条恒定截面、散热或框架：考虑型材挤压。
`,
  },
  {
    id: 'assembly-dfa',
    category: '05 装配连接',
    title: '装配设计：先定位，再固定，最后防错和可维修',
    summary: '把螺丝、卡扣、热熔、胶粘、压铆、密封和线缆固定纳入 DFA 思路。',
    keywords: ['assembly', 'dfa', 'screw', 'fastener', 'snap-fit', 'heat-staking', 'rivet', 'pem', 'vhb', 'oring', 'gasket', 'seal', 'ip67', 'waterproof', 'poka', 'interference', 'bom', 'ecn', '装配', '螺丝', '紧固', '卡扣', '热熔', '密封', '防水', '防呆', '定位', '干涉'],
    content: `
## 装配设计的第一原则：结构职责分离

好的装配不是把零件“固定住”这么简单，而是让定位、限位、锁紧、防错、维修和检测都有明确职责。

### 先定位，再固定

定位结构负责决定零件相对位置，固定结构负责提供保持力。常见组合：

- 一面两孔：平面定 Z，一圆孔定 X/Y，一长圆孔释放热胀和公差。
- 止口/定位柱：控制上下壳错位和段差。
- 螺丝：提供夹紧力，不应单独承担精确定位。
- 卡扣：适合快速装配和局部锁紧，但要考虑拆装寿命。

### DFA 常见优化方向

- 减少零件数量和紧固件种类。
- 减少装配方向，尽量单方向装配。
- 增加导向特征，避免靠工人手感找位置。
- 防止零件装反、漏装、错装。
- 给螺丝刀、治具、手指和线缆留操作空间。
- 关键零部件设计止位，避免过压、过插和过行程。

### 螺丝连接

螺丝连接要关注锁附深度、扭矩、预紧力、材料蠕变和防松。塑胶自攻螺丝柱和金属螺纹孔的设计逻辑不同：

- 塑胶柱主要看孔径、柱外径、锁附深度、爆柱风险。
- 金属螺纹主要看有效牙长、强度等级、预紧力和防松方式。
- 不建议靠弹垫解决所有防松问题，振动场景要评估螺纹胶、尼龙锁紧、机械防松或结构止退。

### 防水密封

防水不是只有 O 圈。常见方案包括 O 圈、泡棉胶、点胶、灌封、超声波焊接、透气膜、迷宫结构和连接器密封。

O 圈设计重点：

- 压缩率通常在 15%-30% 范围内选取，动密封和静密封不同。
- 沟槽填充率要留膨胀空间，不能把 O 圈塞满。
- 沟槽表面粗糙度、分型线、装配扭曲都会影响泄漏。
- 螺丝布置要保证压缩均匀，避免局部翘起。

### 面试答题模板

问“上下壳怎么设计可靠”时，可以从止口定位、螺丝/卡扣锁紧、防呆、装配顺序、维修拆卸、密封、跌落和公差闭环几个点展开，而不是只说“加螺丝”。
`,
  },
  {
    id: 'tolerance-gdt',
    category: '06 公差与图纸',
    title: '公差与 GD&T：用基准表达功能，而不是堆正负公差',
    summary: '初学者先掌握基准、尺寸链、位置度、轮廓度和最坏情况分析。',
    keywords: ['tolerance', 'gdt', 'gd&t', 'datum', 'mmc', 'lmc', 'position', 'flatness', 'perpendicularity', 'runout', 'profile', 'rss', 'cpk', 'drawing', 'cad', 'roughness', '公差', 'GD_T', 'GD&T', '基准', '位置度', '平面度', '垂直度', '尺寸链', '工程图', '粗糙度'],
    content: `
## 为什么要学 GD&T

传统正负公差能表达尺寸范围，但很难准确表达“零件靠哪里装配、哪些面决定功能、孔组相对基准如何检测”。GD&T 的价值是用基准和几何公差把功能意图传递给制造、检测和供应商。

### 初学者学习顺序

1. 看懂基准：A/B/C 不是随便标，通常来自装配、检测或功能面。
2. 看懂尺寸要素：孔、轴、槽、宽度这类有实际尺寸的特征。
3. 看懂形状/方向/位置：平面度、垂直度、位置度、轮廓度分别管什么。
4. 理解 MMC/LMC/RFS：什么时候可以获得 bonus tolerance。
5. 会做简单尺寸链：极值法先保证最坏情况，再理解 RSS 的统计前提。

### 基准选择

基准来自功能，不来自绘图习惯。常见规则：

- 第一基准通常约束最大接触面或主要装配面。
- 第二、第三基准用于消除剩余自由度。
- 一面两孔是常见定位方式：面定位，圆孔定位，长孔释放公差。
- 柔性件、薄壁件和注塑件要谨慎选择易变形面作基准。

### 位置度为什么比 X/Y 正负公差更合理

孔的位置如果用 X/Y 坐标公差，公差带是方形；位置度的公差带通常是圆形，更贴合装配销或螺丝通过孔的功能。带 MMC 的位置度还能在孔做大时给出额外装配余量。

### 公差分析的基本流程

1. 定义目标：间隙、段差、插拔力、密封压缩量还是孔位通过率。
2. 建立尺寸链：只保留影响目标的尺寸。
3. 判断正负方向：哪个尺寸增大会让目标变大或变小。
4. 选择方法：极值法保守，RSS 需要过程稳定且近似独立。
5. 优化方案：调整基准、放宽非关键尺寸、减少链环、改变结构定位。

### 图纸审核清单

- 关键装配面是否有基准？
- 公差是否和制造能力匹配，是否过度收紧？
- 尺寸是否便于加工和检测？
- 表面处理、材料、热处理、外观要求是否写清？
- BOM、图纸版本、物料编码和 3D 模型是否一致？
`,
  },
  {
    id: 'surface-finishing',
    category: '07 表面与外观',
    title: '表面处理：外观、耐久、材料相容性要一起验证',
    summary: '喷涂、电镀、PVD、阳极、镭雕、丝印、咬花的选择逻辑。',
    keywords: ['surface', 'paint', 'uv', 'plating', 'pvd', 'anodizing', 'passivation', 'laser', 'screen', 'pad', 'texture', 'rca', 'cross-cut', 'salt-spray', '表面', '喷涂', '电镀', 'PVD', '阳极', '镭雕', '丝印', '咬花', '附着力'],
    content: `
## 表面处理不是最后一道美容工序

表面处理会影响尺寸、装配、可靠性、环保和成本。结构设计阶段就要考虑遮蔽、挂点、导电区域、外观分型、耐磨路径和测试标准。

### 常见工艺对比

| 工艺 | 适合 | 风险 |
|---|---|---|
| 喷涂/UV | 塑胶外观件、手感、颜色 | 附着力、耐磨、橘皮、色差 |
| 塑胶电镀 | ABS/PC+ABS 装饰件 | 环保、结合力、尖角烧焦、成本 |
| PVD | 金属质感、耐磨装饰 | 基材温度、膜层附着、遮蔽 |
| 阳极氧化 | 铝件外观和耐腐蚀 | 铸铝不适合高外观阳极，色差 |
| 镭雕/丝印/移印 | 标识、按键字符 | 耐磨、定位、油墨相容性 |
| 咬花/蚀纹 | 隐藏缺陷、触感 | 拔模角要加大，纹深影响脱模 |

### 塑胶喷涂附着力为什么会失败

- 材料表面能低，如 PP/PE 不易附着。
- 脱模剂、油污、手汗或水分未清洁。
- 底漆和面漆体系不匹配。
- 基材应力过大，冷热冲击后开裂。
- 结构尖角和薄边膜厚不足。

### 外观可靠性测试

常见测试包括百格、RCA 纸带、铅笔硬度、酒精/汗液/化妆品擦拭、冷热冲击、UV 老化、盐雾和跌落后外观检查。面试回答时要把“工艺选择”和“验证标准”一起说。
`,
  },
  {
    id: 'dfm-npi-reliability',
    category: '08 DFM/NPI/验证',
    title: 'DFM 与 NPI：从 EVT 到量产的结构工程闭环',
    summary: '解释结构工程师在评审、试模、验证、量产和 ECN 中的工作边界。',
    keywords: ['dfm', 'npi', 'evt', 'dvt', 'pvt', 'mp', 'ecn', 'bom', 'fai', 'fot', 'cmm', 'cpk', 'ppk', 'dfmea', 'pfmea', '8d', 'doe', 'reliability', 'salt', 'drop', 'vibration', '85-85', 'NPI', 'DFM', 'EVT', 'DVT', 'PVT', '试模', '量产', '可靠性', '8D', 'DOE'],
    content: `
## NPI 不是流程名词，是风险逐步收敛

结构工程师在 NPI 中的价值，是把设计风险、制造风险、装配风险、可靠性风险和供应链风险逐步关闭。

### 阶段理解

- EVT：验证设计可行性。关注结构方案、堆叠、装配干涉、基础强度和功能风险。
- DVT：验证设计成熟度。关注可靠性、尺寸稳定、外观标准、环境测试和设计冻结。
- PVT：验证生产能力。关注产线节拍、良率、工装、SOP、CPK/PPK 和首批问题。
- MP：量产维护。关注 ECN、降本、异常闭环、供应商质量和持续改善。

### DFM 评审应该看什么

塑胶：壁厚、拔模、倒扣、浇口、顶针、缩水、熔接线、模具钢材和冷却。

钣金：折弯半径、孔边距、展开、压铆、焊接变形、表面处理和毛刺方向。

压铸：壁厚、排气、浇口、顶出、气孔、后加工基准和密封面。

装配：装配顺序、操作空间、治具、防呆、扭矩、维修和测试。

### 可靠性测试和结构设计的关系

- 跌落：看壳体刚性、卡扣/螺丝柱、PCB 支撑和电池固定。
- 振动：看螺丝防松、线缆固定、共振频率和连接器保持力。
- 高低温/冷热冲击：看热胀冷缩、材料脆化、胶粘和密封。
- 湿热/盐雾：看腐蚀、电镀、密封和材料老化。
- 85/85：常用于电子和涂层可靠性验证，要关注失效机理是否一致。

### 问题闭环

8D 或 A3 报告不只是填表。结构工程师要区分症状、直接原因、根因、临时遏制、永久对策和横向展开。比如“螺丝柱开裂”不能只写“加厚柱子”，还要验证孔径、扭矩、材料、柱根 R、锁附深度、螺丝规格和产线工具。
`,
  },
  {
    id: 'thermal-emc-advanced',
    category: '09 高阶专题',
    title: '热设计、EMC 与仿真：结构工程师的进阶能力',
    summary: '把散热路径、屏蔽路径、力学仿真和环境可靠性放在产品层面理解。',
    keywords: ['thermal', 'heat', 'fan', 'tim', 'graphite', 'heat-pipe', 'emc', 'emi', 'shield', 'gasket', 'fea', 'mesh', 'stress', 'modal', 'drop', 'simulation', '散热', '热设计', 'EMC', '屏蔽', 'FEA', '仿真', '跌落', '振动'],
    content: `
## 高阶题的共同点：不是单个零件，而是系统路径

热设计看热从芯片到空气的路径；EMC 看电磁泄漏和接地回流路径；FEA 看载荷、约束和材料模型是否代表真实工况。

### 热设计

热路径通常是：热源 → TIM → 金属件/热管/石墨片 → 散热片/外壳 → 空气。结构工程师要关注：

- 热源位置和功耗是否明确。
- TIM 厚度越薄越好，但必须补偿装配公差。
- 风道不能被线缆、筋位、泡棉堵住。
- 塑胶导热差，不能把塑胶壳体当成主要散热件。
- 表面温度限制和器件结温限制不是同一件事。

### EMC

屏蔽效果来自连续导电路径。缝隙、孔洞、喷涂绝缘、螺丝间距过大都会削弱屏蔽。

- 屏蔽罩要有可靠接地弹片或焊接点。
- 导电泡棉/导电布要控制压缩量和压缩永久变形。
- 结构开孔要考虑孔径、频率和排列。
- 散热孔和 EMC 常有冲突，需要联合评审。

### FEA 仿真

仿真不是“跑一个云图”。要先定义目的：刚度、强度、跌落、模态、疲劳还是卡扣插入力。结果可信度取决于材料模型、边界条件、网格、接触、载荷和实验校准。

### 面试回答

遇到高阶题，先讲物理路径，再讲结构措施，再讲验证方法。比如散热题按热阻路径回答；EMC 题按屏蔽连续性回答；仿真题按前处理、求解、后处理和实验校准回答。
`,
  },
  {
    id: 'industry-specific',
    category: '10 行业专项',
    title: '行业专项：连接器、服务器、消费电子、机器人和穿戴医疗',
    summary: '把同一套材料/工艺/公差能力迁移到不同产品场景。',
    keywords: ['connector', 'server', 'telecom', 'consumer', 'battery', 'wearable', 'medical', 'robot', 'gear', 'bearing', 'thread', 'spring', '连接器', '服务器', '消费电子', '机器人', '穿戴', '医疗', '齿轮', '轴承', '螺纹', '弹簧'],
    content: `
## 行业题考的是迁移能力

不同公司面试侧重点不同，但底层仍是材料、工艺、装配、公差和可靠性。

### 连接器与精密器件

重点关注端子冲压、电镀层、插拔力、接触电阻、插拔寿命、塑胶耐热和精密公差。位置度、基准和检具能力很重要。

### 通信/服务器

重点关注钣金机箱、模块化插拔、散热风道、EMC、线缆管理、接地、振动和维护便利性。塑胶通常不是主承力结构。

### 消费电子

重点关注外观段差、窄边框、跌落、电池膨胀、微型按键、防水、胶粘和量产良率。

### 机器人/机电

重点关注电机固定、传动、轴承、齿轮、同步带、结构刚度、疲劳和装配调试。

### 穿戴/医疗

重点关注人体接触材料、防水、消毒、皮肤温升、微小装配、可靠性和法规。

### 小家电

重点关注大型注塑件变形、成本、装配效率、模具稳定性、安规距离和量产节拍。
`,
  },
];

const fallbackRules = [
  { id: 'material-selection-core', tests: ['material', 'plastic', 'abs', 'pc', 'pa', 'pom', 'pbt', 'pet', 'pps', 'peek', 'pei', 'lcp', 'pp', 'pmma', 'gf', 'rohs', 'reach', 'ul94', 'fr', 'density', 'thermal', 'wear'] },
  { id: 'plastic-part-design', tests: ['wall', 'rib', 'boss', 'snap', 'draft', 'fillet', 'sink', 'gate', 'ejector', 'tongue', 'groove', 'ultrasonic', 'weld', 'parting'] },
  { id: 'injection-mold-process', tests: ['molding', 'injection', 'mold', 'runner', 'cooling', 'vent', 'slider', 'lifter', 'warpage', 'flash', 'silver', 'burn', 'holding', 'cavity', 'screw'] },
  { id: 'metal-processes', tests: ['sheet', 'bend', 'k-factor', 'spcc', 'secc', 'sgcc', 'sus', 'al5052', 'diecast', 'adc12', 'cnc', '6061', '7075', 'extrusion', 'anodizing'] },
  { id: 'assembly-dfa', tests: ['assembly', 'dfa', 'screw', 'fastener', 'heat-staking', 'rivet', 'pem', 'vhb', 'oring', 'gasket', 'seal', 'ip67', 'ipx', 'waterproof', 'poka', 'interference', 'bom', 'ecn'] },
  { id: 'tolerance-gdt', tests: ['tolerance', 'gdt', 'datum', 'mmc', 'lmc', 'position', 'flatness', 'perpendicularity', 'runout', 'profile', 'rss', 'cpk', 'drawing', 'cad', 'roughness', 'thread'] },
  { id: 'surface-finishing', tests: ['surface', 'paint', 'uv', 'plating', 'pvd', 'passivation', 'laser', 'screen', 'pad', 'texture', 'rca', 'cross-cut', 'salt-spray'] },
  { id: 'dfm-npi-reliability', tests: ['dfm', 'npi', 'evt', 'dvt', 'pvt', 'mp', 'fai', 'fot', 'cmm', 'ppk', 'dfmea', 'pfmea', '8d', 'doe', 'reliability', 'drop', 'vibration', '85-85', 'trial', 'golden'] },
  { id: 'thermal-emc-advanced', tests: ['thermal', 'heat', 'fan', 'tim', 'graphite', 'heat-pipe', 'emc', 'emi', 'shield', 'fea', 'mesh', 'stress', 'modal', 'simulation'] },
  { id: 'industry-specific', tests: ['connector', 'server', 'telecom', 'consumer', 'battery', 'wearable', 'medical', 'robot', 'gear', 'bearing', 'spring'] },
];

export function findKnowledgeArticle(knowledgeId = '', category = '') {
  const exact = knowledgeArticles.find((article) => article.id === knowledgeId);
  if (exact) return exact;

  const byId = (id) => knowledgeArticles.find((article) => article.id === id);

  // Stable category ownership takes precedence over fuzzy keyword matching.
  if (category.includes('钣金') || category.includes('压铸') || category.includes('型材') || category.includes('CNC')) {
    return byId('metal-processes');
  }
  if (category.includes('公差') || category.includes('图纸') || category.includes('GD') || category.includes('CAD')) {
    return byId('tolerance-gdt');
  }
  if (category.includes('热设计') || category.includes('热管理') || category.includes('EMC') || category.includes('FEA') || category.includes('仿真')) {
    return byId('thermal-emc-advanced');
  }
  if (category.includes('NPI') || category.includes('DFM') || category.includes('开发') || category.includes('验证') || category.includes('可靠性') || category.includes('DFMEA') || category.includes('DOE') || category.includes('8D')) {
    return byId('dfm-npi-reliability');
  }
  if (category.includes('表面') || category.includes('涂层') || category.includes('电镀')) {
    return byId('surface-finishing');
  }
  if (category.includes('装配') || category.includes('防水') || category.includes('密封') || category.includes('螺纹') || category.includes('紧固')) {
    return byId('assembly-dfa');
  }
  if (category.includes('注塑工艺') || category.includes('模具') || category.includes('塑胶缺陷')) {
    return byId('injection-mold-process');
  }
  if (category.includes('塑胶结构') || category.includes('结构件设计')) {
    return byId('plastic-part-design');
  }
  if (category.includes('行业') || category.includes('通信') || category.includes('连接器') || category.includes('机器人')) {
    return byId('industry-specific');
  }
  if (category.includes('材料') || category.includes('性能') || category.includes('安全与合规')) {
    return byId('material-selection-core');
  }

  const target = `${knowledgeId} ${category}`.toLowerCase();
  const tokens = new Set(target.split(/[^a-z0-9]+/).filter(Boolean));
  const direct = knowledgeArticles.find((article) =>
    article.keywords.some((keyword) => {
      const normalized = keyword.toLowerCase();
      if (/^[a-z0-9]+$/.test(normalized)) return tokens.has(normalized);
      return normalized.length >= 4 && target.includes(normalized);
    })
  );
  if (direct) return direct;

  const rule = fallbackRules.find((item) => item.tests.some((keyword) => tokens.has(keyword)));
  if (rule) return knowledgeArticles.find((article) => article.id === rule.id);

  return knowledgeArticles[0];
}

export function getKnowledgeHref(knowledgeId = '', category = '') {
  const article = findKnowledgeArticle(knowledgeId, category);
  return `/kb?topic=${encodeURIComponent(article.id)}`;
}

export default knowledgeArticles;
