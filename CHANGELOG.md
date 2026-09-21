# Changelog · 藏锋录 (CangFeng)

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/) 规范，版本号遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)。

---

## [1.2.0] - 2026-09-21

### 新增 (Added)
- **浮动信息提示悬窗 (Floating Metadata Window)**：
  - 将原本右侧固定的推拉抽屉重构为高质感磨砂玻璃浮动悬窗（Glassmorphic Floating Panel）。
  - **自由拖拽移动**：支持按住悬窗顶部手柄（带三道横线 Grip 视觉标记）拖拽至屏幕任意位置。
  - **8 向拉伸调整尺寸 (8-directional Resize)**：支持对四角（NW, NE, SW, SE）及四边（N, S, W, E）进行尺寸拖动拉伸，光标自适应变化，右下角带有斜纹指示标记。
  - **视口边界防护 (Viewport Clamp)**：拖拽与拉伸均内置 16px 视口吸附保护，避免窗口被拖出屏幕外；浏览器窗口大小改变时自动回弹至安全可见区域。
  - **快捷键呼出**：支持键盘 `Tab` 键及 `I` 键一键弹出 / 收起信息悬窗，带来沉浸式观览体验。
  - **自适应动态透光度机制 (Adaptive Opacity Interaction)**：
    - 鼠标在悬浮窗上悬停时，呈现清晰易读的 **80% 不透明度**（`opacity: 0.8`）；
    - 鼠标在地图上进行滚轮或手势缩放时，悬窗瞬间降为 **30% 不透明度**（`opacity: 0.3`），实现极致通透的底层空间纹理观察体验，停止缩放后平滑过渡恢复。

### 修复 (Fixed)
- **描述文本横向溢出问题 (Text Overflow Fix)**：
  - 修复 `.drawer-content` 默认 `overflow-y: auto` 导致 `overflow-x` 隐式计算为 auto 引起的长文本溢出问题，显式声明 `overflow-x: hidden`。
  - 为 `.meta-desc` 与 `.meta-desc-text` 补充 `overflow-wrap: break-word` 与 `max-width: 100%`，确保工造题记与解析度说明在任意悬窗宽度下自适应折行。
- **主调色板萃取无结果缺陷修复 (Color Palette Extraction Fix)**：
  - 修复 `extractDominantColors` 异步图像加载时遗漏给 `img.src` 赋值导致 `onload` 永远无法触发、面板持续卡在“提取中...”的致命缺陷。
  - 引入 DOM 已加载卡片缩略图优先内存复用机制（0ms 秒级响应，无需发起二次网络请求）。
  - 增强颜色欧氏距离色差聚类去重算法，并内置高精度专属工造主色谱优雅兜底，杜绝白屏或提取失败。

---

## [1.1.0] - 2026-09-21

### 新增 (Added)
- **双层隐形数字盲水印取证引擎 (Stealth Watermark Engine)**：
  - 集成前端自检网格与取证系统，支持快捷键 `Alt+W` 或 `Shift+W` 触发取证 HUD 探针，显影隐藏在画幅纹理中的版权追踪签名。
  - 引入微透明度水印算法（人眼不可见，但在图像处理软件高反差曲线拉升下清晰可辨）。
- **防盗链与防截屏多维防护机制**：
  - 全局拦截右键菜单（Context Menu）、禁止图片拖拽，屏蔽 `Ctrl+S`、`Ctrl+P` 等扒图快捷键。
  - 增加打印介质保护规则（`@media print`），阻断网页直印商用行为。

### 变更 (Changed)
- **成果档案元数据优化**：统一五大核心传世卷（上海矢量肌理、激光剪纸系列、锦江绿道山水剖面等）的比例、门类与原解析度元数据。
- **瓦片网络链路接入**：`assets/config.js` 正式接入 `CangFengCore` 私有云托管切片节点（`https://cangfengcore.lidmwork.workers.dev`）。

---

## [1.0.0] - 2026-09-21

### 新增 (Added)
- **藏锋录初始版本发布 (Initial Release)**：
  - 纯原生前端工程（HTML5 + CSS3 + ES6），完全摒弃冗余的打包器依赖。
  - 集成 OpenSeadragon 5.0，支持 WebP 多层级物理金字塔深览（Deep Zoom）。
  - 支持浅色 / 深色（Light / Dark）艺术馆级主题自由切换。
  - 紧凑网格（Dense）与宽松网格（Comfort）双版式排版。
  - 基于 Canvas 的作品主色调萃取调色板系统（一键复制 HEX 颜色值）。
