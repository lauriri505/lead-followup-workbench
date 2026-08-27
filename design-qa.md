# Design QA — 用户信息与订单状态布局

- source visual truth path: `source-order-status-layout.png`
- implementation screenshot path: `implementation-full.png`
- source pixels: 1408 × 754
- implementation pixels: 720 × 357（从 1500 × 954 桌面浏览器视图裁取的用户信息区域）
- CSS viewport: 1500 × 1000，deviceScaleFactor 1
- responsive viewport: 390 × 844，deviceScaleFactor 1
- state: 中文界面、首条普通线索、订单状态“未标记”、订单状态弹窗关闭

## Full-view comparison evidence

参考图与实现截图已在同一轮视觉对照中打开。实现保留现有工作台的信息密度、三列字段栅格和状态标签风格，并按本次要求把订单状态移动到全部线索、经销商和金融信息之后。订单状态不再使用浅灰背景和四周边框，仅以顶部细分隔线与上方信息区分。

## Focused region comparison evidence

本次变更仅涉及用户信息卡片内部，因此使用用户信息区域裁图作为聚焦对照。浏览器计算样式验证结果：

- 订单状态顶部坐标晚于信息区底部坐标，确认位于全部用户信息之后。
- `background-color: transparent`。
- 左、右、下边框均为 0，仅保留 1px 顶部分隔线。
- `border-radius: 0`，不存在订单信息方块容器。

## Required fidelity surfaces

- Fonts and typography: 沿用现有 CRM 字体、字号和字重，未产生新的字体漂移。
- Spacing and layout rhythm: 订单状态与详细字段间保留 16px 间距，顶部 1px 分隔线形成清晰但轻量的层级。
- Colors and visual tokens: 沿用现有灰阶、状态色和按钮样式；移除订单状态外层浅灰底。
- Image quality and asset fidelity: 本区域无新增图片或图标资产。
- Copy and content: “订单状态”“未标记”“尚未人工标记”“更新状态”及所有标准状态选项保持不变。

## Interaction and responsive checks

- “更新状态”按钮可打开独立订单状态弹窗。
- 可选状态保持为：未标记、信审中、已签合同、等待放款、放款成功、已提车。
- 390 × 844 视口无横向溢出，状态区和按钮均在可视范围内。
- 浏览器控制台错误：0。

## Findings

- 无 P0、P1 或 P2 问题。

## Comparison history

- 初始问题：订单状态位于用户摘要和详细字段之间，并使用带背景、边框和圆角的方块容器。
- 修复：将订单状态节点移动到信息区之后；改为透明背景、无圆角、仅顶部细分隔线。
- 修复后证据：桌面端 DOM 位置、计算样式、聚焦截图及 390px 响应式检查均符合要求。

## Follow-up polish

- 无必须处理的 P3 项。

final result: passed
