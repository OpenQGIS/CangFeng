# CangFeng · 藏锋录
### Personal Spatial Craft & Visual Masterworks Archive
> 《藏锋录 · 个人空间工造与视觉成果典藏》—— “十年淬砺，一朝功成；霜刃入鞘，藏锋于卷。”

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Architecture: Decoupled-Cloudflare](https://img.shields.io/badge/Architecture-Decoupled%20Cloudflare-orange.svg)](#system-architecture)
[![Design: Anti--AI%20Craft](https://img.shields.io/badge/Design-Anti--AI%20Craft-black.svg)](#design-philosophy)

---

## 1. 成果集题记与理念 (Philosophy & Overview)

**《藏锋录 · CangFeng》** 是创作者个人在空间测绘几何、高精度激光剪纸镂刻、城市肌理剖面与秩序版式领域的代表作成果集大成。

在东方工造与传统武侠美学中，名师千锤百炼铸就神兵，功成之后，不事喧哗，敛芒入卷，故名**“藏锋”**。
本成果集严选 5 幅具有里程碑意义的个人原创成果，涵盖数千万节点矢量运算、微米级物理激光切割与高阶调色板萃取。

### 收录传世卷目 (Featured Masterworks)
1. **上海市中心城区空间肌理 (`shanghai`)**
   - 提取自上海核心都会区的高维建筑轮廓与路网骨架，千万级节点高密度几何重构。
2. **城市剪纸-14PRO (`city_papercut_14pro`)**
   - 针对智能移动终端尺度的激光微雕纸卷构图，方寸转折之间起伏千里城郭。
3. **成都剪纸-iPAD_pro (`chengdu_papercut_ipad`)**
   - 蜀都千年古城肌理与现代平板比例的镂空艺术融合。
4. **锦江绿道黄龙溪段空间立面剖面 (`jinjiang_greenway_section`)**
   - 融合水文走势、山地高程剖切与生态游径的超大幅面立面画卷。
5. **布局方式2 (`layout_pattern_02`)**
   - 理性严谨的栅格秩序构图与现代极简设计版式。

---

## 2. 系统架构与分发机制 (Architecture & Cloud Decoupling)

本仓库采用 **“前端开源 + 核心切片私有云挂载”** 的现代化安全分发架构：

```text
┌────────────────────────────────────────────────────────────┐
│              CangFeng 前端界面 (GitHub 开源)               │
│      极轻量仓库 (<10MB) · 包含 UI / 缩略图 / 元数据 / 交互   │
└─────────────────────────────┬──────────────────────────────┘
                              │
                              │ 1:1 DeepZoom 4K 瓦片跨域拉取
                              ▼
┌────────────────────────────────────────────────────────────┐
│           CangFengCore 私有云基座 (Cloudflare Pages)        │
│          仅托管 5 幅成果的超高清 WebP 瓦片金字塔 (tiles/)   │
│          配置 CORS: Access-Control-Allow-Origin: *         │
└────────────────────────────────────────────────────────────┘
```

- **开源透明**：外界可在 GitHub 检视完整的响应式布局系统、色彩萃取算法与 OpenSeadragon 视口引擎实现。
- **资产受控**：超高清原始素材与深层切片（tiles）物理隔离于私有云节点中，有效防御未经授权的整库高保真翻印与批量爬取。

---

## 3. 关联生态 (Related Ecosystem)

- **《Cabinet · 珍奇柜》**: [OpenQGIS/Cabinet](https://github.com/OpenQGIS/Cabinet) —— 全球卫星遥感与国家标准地图要素的公开共享图志（全量开源）。
- **《Gallery · 典藏画廊》**: [OpenQGIS/Gallery](https://github.com/OpenQGIS/Gallery) —— 双门面聚合展示大厅（合流《藏锋录》与《珍奇柜》）。

---

## 4. 本地使用与部署 (Getting Started)

### 本地快速浏览
1. 克隆本仓库：
   ```bash
   git clone https://github.com/OpenQGIS/CangFeng.git
   cd CangFeng
   ```
2. Windows 环境下直接双击：
   ```text
   双击浏览藏锋录.bat
   ```
   或使用任意浏览器直接打开 `index.html`。页面默认通过 `assets/config.js` 中配置的 Cloudflare Pages 节点远程拉取高倍率切片。

---

## 5. 开源许可与版权声明 (License & Copyright)

- 本项目界面代码、交互控制器与工程模板遵循 [MIT License](LICENSE) 协议开源。
- 成果集中所有原创视觉图形、激光纸雕切线及设计著作权归创作者本人所有。
