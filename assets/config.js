/**
 * CangFeng · 藏锋录 成果集配置与云端挂载定义
 *
 * 挂载逻辑与安全架构：
 * 1. 本仓库为【前端开源，核心切片数据闭源挂载】模式。
 * 2. assetBaseUrl: 指向 Cloudflare Pages 私有核心资产基座（例如 'https://gallerycore.pages.dev'）。
 *    页面在进行 OpenSeadragon 1:1 物理像素深览时，会自动从该 CDN 远程拉取十亿像素 WebP 瓦片金字塔。
 *    若本地已有 tiles/ 文件夹且置空 assetBaseUrl，系统亦可优雅降级为纯本地读取。
 * 3. 外部生态关联：支持一键导航回 Gallery 聚合大厅与 Cabinet 共享精选库。
 */
window.CANGFENG_CONFIG = {
  // 外部挂载 CDN 节点 (Cloudflare 托管全量切片，结尾不带斜杠)
  assetBaseUrl: 'https://cangfengcore.lidmwork.workers.dev',

  // 云端全景展厅直达链接
  coreLiveUrl: 'https://cangfengcore.lidmwork.workers.dev',

  // 共享精选库外链 (Cabinet)
  cabinetUrl: 'https://github.com/OpenQGIS/Cabinet',

  // 中央聚合大厅外链 (Gallery)
  galleryPortalUrl: 'https://github.com/OpenQGIS/Gallery',

  // 本仓库开源主页
  repositoryUrl: 'https://github.com/OpenQGIS/CangFeng',

  // 成果集品牌与题记
  brand: {
    title: 'CANGFENG · 藏锋录',
    subtitle: '个人空间工造 · 视觉成果典藏',
    tagline: '十年淬砺 · 霜刃入鞘 · 藏锋于卷'
  }
};
