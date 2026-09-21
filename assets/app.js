/**
 * CangFeng · 藏锋录 核心应用程序 (v1.0.0)
 * 个人空间工造与视觉成果典藏 · WebP 4K Deep Zoom 深览系统
 * 前端开源 + 核心数据 Cloudflare Pages 挂载架构
 */

(function () {
  'use strict';

  // Global State
  let galleryItems = [];
  let currentFilteredItems = [];
  let currentViewerIndex = -1;
  let osdViewer = null;
  let currentFilter = 'all';

  const SVG_EXIT_FULLSCREEN = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>';
  const SVG_FULLSCREEN = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
  const SVG_ZOOM = '<svg class="icon mini" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';

  // Initialize
  async function init() {
    bindAntiTheft();

    if (window.GALLERY_MANIFEST) {
      setupData(window.GALLERY_MANIFEST);
      initGallery();
      return;
    }

    try {
      const res = await fetch('data/manifest.json');
      if (!res.ok) throw new Error('Manifest not found');
      const data = await res.json();
      setupData(data);
      initGallery();
    } catch (err) {
      console.error('Failed to load CangFeng manifest:', err);
      const grid = document.getElementById('galleryGrid');
      if (grid) {
        grid.innerHTML = '<div style="padding: 24px; color: #ff5555; font-family: var(--font-mono); font-size: 0.85rem;">' +
          '[Error] 无法读取成果索引 (data/manifest.json)，请检查网络或 data/manifest.js。</div>';
      }
    }
  }

  function setupData(rawItems) {
    const config = window.CANGFENG_CONFIG || {};
    const assetBase = (config.assetBaseUrl || '').replace(/\/+$/, '');

    galleryItems = rawItems.map((item, idx) => {
      item.globalIndex = idx;
      if (assetBase) {
        if (item.tileUrl && !item.tileUrl.startsWith('http')) {
          item.tileUrl = assetBase + '/' + item.tileUrl.replace(/^\/+/, '');
        }
      }
      return item;
    });
  }

  function initGallery() {
    const countEl = document.getElementById('pageItemCount');
    if (countEl) countEl.textContent = galleryItems.length;

    bindFilterEvents();
    bindViewModeEvents();
    bindViewerModalEvents();

    applyFilter('all');
  }

  /* -------------------------------------------------------------
     Filters & Grid Rendering
     ------------------------------------------------------------- */
  function bindFilterEvents() {
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        applyFilter(chip.dataset.filter || 'all');
      });
    });
  }

  function applyFilter(filterVal) {
    currentFilter = filterVal;
    let pool = [...galleryItems];

    if (filterVal === 'wide') {
      pool = pool.filter(i => i.aspectRatio >= 1.2);
    } else if (filterVal === 'tall') {
      pool = pool.filter(i => i.aspectRatio <= 0.8);
    }

    currentFilteredItems = pool;
    renderGrid(pool);
  }

  function renderGrid(items) {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (items.length === 0) {
      grid.innerHTML = '<div style="padding: 48px 24px; color: var(--text-muted); text-align: center; width: 100%;">' +
        '当前筛选条件下暂无收录成果</div>';
      return;
    }

    items.forEach((item, localIdx) => {
      grid.appendChild(createCard(item, localIdx));
    });
  }

  function createCard(item, localIdx) {
    const card = document.createElement('article');
    card.className = 'gallery-card';
    card.tabIndex = 0;
    card.style.setProperty('--aspect-ratio', item.aspectRatio);

    const tagsHtml = (item.tags || []).map(t => '<span class="tag-pill">' + escapeHtml(t) + '</span>').join('');

    card.innerHTML = 
      '<div class="card-media">' +
        '<img class="card-img" src="' + item.thumb + '" alt="' + escapeHtml(item.title) + '" loading="lazy" />' +
        '<div class="card-scrim-mask">' +
          '<div class="card-scrim-content">' +
            '<h3 class="card-title" title="' + escapeHtml(item.title) + '">' + escapeHtml(item.title) + '</h3>' +
            '<div class="card-meta-row">' +
              '<div class="card-tags">' +
                tagsHtml +
              '</div>' +
              '<div class="card-action-hint">' +
                SVG_ZOOM +
                ' <span>深览</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    const img = card.querySelector('.card-img');
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.onload = () => img.classList.add('loaded');
    }

    card.addEventListener('click', () => openViewerByItem(item));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openViewerByItem(item);
      }
    });

    return card;
  }

  function bindViewModeEvents() {
    const grid = document.getElementById('galleryGrid');
    const btnDense = document.getElementById('btnGridDense');
    const btnComfort = document.getElementById('btnGridComfort');
    if (!grid || !btnDense || !btnComfort) return;

    btnDense.addEventListener('click', () => {
      btnDense.classList.add('active');
      btnComfort.classList.remove('active');
      grid.classList.remove('comfort-mode');
    });

    btnComfort.addEventListener('click', () => {
      btnComfort.classList.add('active');
      btnDense.classList.remove('active');
      grid.classList.add('comfort-mode');
    });
  }

  /* -------------------------------------------------------------
     Deep Zoom Viewer Modal & Palette Drawer
     ------------------------------------------------------------- */
  function bindViewerModalEvents() {
    const modalEl = document.getElementById('viewerModal');
    if (!modalEl || modalEl.dataset.bound) return;
    modalEl.dataset.bound = 'true';

    const backdropEl = document.getElementById('viewerBackdrop');
    const closeBtn = document.getElementById('btnCloseViewer');
    const prevBtn = document.getElementById('btnPrevArtwork');
    const nextBtn = document.getElementById('btnNextArtwork');
    const edgePrevBtn = document.getElementById('btnEdgePrev');
    const edgeNextBtn = document.getElementById('btnEdgeNext');
    const toggleInfoBtn = document.getElementById('btnToggleInfo');
    const drawerEl = document.getElementById('viewerMetaDrawer');
    const drawerCloseBtn = document.getElementById('btnCloseDrawer');

    const toolZoomIn = document.getElementById('toolZoomIn');
    const toolZoomOut = document.getElementById('toolZoomOut');
    const toolReset = document.getElementById('toolReset');
    const toolRotate = document.getElementById('toolRotate');
    const toolFullscreen = document.getElementById('toolFullscreen');
    const toolActualSize = document.getElementById('toolActualSize');

    backdropEl.addEventListener('click', closeViewer);
    closeBtn.addEventListener('click', closeViewer);
    prevBtn.addEventListener('click', () => navigateArtwork(-1));
    nextBtn.addEventListener('click', () => navigateArtwork(1));
    if (edgePrevBtn) edgePrevBtn.addEventListener('click', () => navigateArtwork(-1));
    if (edgeNextBtn) edgeNextBtn.addEventListener('click', () => navigateArtwork(1));

    if (toggleInfoBtn && drawerEl) {
      toggleInfoBtn.addEventListener('click', () => {
        const isOpen = drawerEl.classList.toggle('open');
        toggleInfoBtn.classList.toggle('active', isOpen);
      });
    }

    if (drawerCloseBtn && drawerEl) {
      drawerCloseBtn.addEventListener('click', () => {
        drawerEl.classList.remove('open');
        if (toggleInfoBtn) toggleInfoBtn.classList.remove('active');
      });
    }

    if (toolActualSize) {
      toolActualSize.addEventListener('click', () => {
        if (osdViewer && osdViewer.viewport) {
          const targetZoom = osdViewer.viewport.imageToViewportZoom(1);
          osdViewer.viewport.zoomTo(targetZoom);
          osdViewer.viewport.applyConstraints();
        }
      });
    }

    if (toolZoomIn) {
      toolZoomIn.addEventListener('click', () => {
        if (osdViewer) {
          osdViewer.viewport.zoomBy(1.35);
          osdViewer.viewport.applyConstraints();
        }
      });
    }

    if (toolZoomOut) {
      toolZoomOut.addEventListener('click', () => {
        if (osdViewer) {
          osdViewer.viewport.zoomBy(1 / 1.35);
          osdViewer.viewport.applyConstraints();
        }
      });
    }

    if (toolReset) {
      toolReset.addEventListener('click', () => {
        if (osdViewer) osdViewer.viewport.goHome();
      });
    }

    if (toolRotate) {
      toolRotate.addEventListener('click', () => {
        if (osdViewer) {
          const curr = osdViewer.viewport.getRotation();
          osdViewer.viewport.setRotation((curr + 90) % 360);
        }
      });
    }

    if (toolFullscreen) {
      toolFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          modalEl.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    document.addEventListener('fullscreenchange', () => {
      const isFs = !!document.fullscreenElement;
      modalEl.classList.toggle('fullscreen-mode', isFs);
      if (toolFullscreen) {
        toolFullscreen.innerHTML = isFs ? SVG_EXIT_FULLSCREEN : SVG_FULLSCREEN;
      }
    });

    window.addEventListener('keydown', (e) => {
      if (!modalEl.classList.contains('open')) return;

      switch (e.key) {
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          } else {
            closeViewer();
          }
          break;
        case 'ArrowLeft':
          navigateArtwork(-1);
          break;
        case 'ArrowRight':
          navigateArtwork(1);
          break;
        case '1':
          if (toolActualSize) toolActualSize.click();
          break;
        case '+':
        case '=':
          if (toolZoomIn) toolZoomIn.click();
          break;
        case '-':
        case '_':
          if (toolZoomOut) toolZoomOut.click();
          break;
        case '0':
        case 'Home':
          if (toolReset) toolReset.click();
          break;
        case 'r':
        case 'R':
          if (toolRotate) toolRotate.click();
          break;
        case 'f':
        case 'F':
          if (toolFullscreen) toolFullscreen.click();
          break;
        case 'i':
        case 'I':
          if (toggleInfoBtn) toggleInfoBtn.click();
          break;
      }
    });

    window.addEventListener('themeChanged', (e) => {
      if (osdViewer) {
        const isDark = (e.detail.theme === 'dark');
        const stage = document.getElementById('osdStage');
        if (stage) stage.style.backgroundColor = isDark ? '#07080b' : '#e5e8ed';
      }
    });
  }

  function openViewerByItem(item) {
    const idx = currentFilteredItems.findIndex(i => i.id === item.id);
    currentViewerIndex = (idx !== -1) ? idx : 0;
    showArtwork(item);
  }

  function navigateArtwork(direction) {
    if (currentFilteredItems.length === 0) return;
    currentViewerIndex = (currentViewerIndex + direction + currentFilteredItems.length) % currentFilteredItems.length;
    showArtwork(currentFilteredItems[currentViewerIndex]);
  }

  function showArtwork(item) {
    const modalEl = document.getElementById('viewerModal');
    if (!modalEl) return;

    const vTitle = document.getElementById('viewerTitle');
    const vDims = document.getElementById('viewerDims');
    const mTitle = document.getElementById('mTitle');
    const mCat = document.getElementById('mCategory');
    const mAuthor = document.getElementById('mAuthor');
    const mRes = document.getElementById('mResolution');
    const mRatio = document.getElementById('mRatio');
    const mDesc = document.getElementById('mDescription');
    const mSwatches = document.getElementById('mPalette');

    if (vTitle) vTitle.textContent = item.title;
    if (vDims) vDims.textContent = item.width + ' × ' + item.height + ' px';
    if (mTitle) mTitle.textContent = item.title;
    if (mCat) mCat.textContent = item.categoryName + (item.subCategory ? ' · ' + item.subCategory : '');
    if (mAuthor) mAuthor.textContent = item.author || '原创';
    if (mRes) mRes.textContent = item.width + ' × ' + item.height + ' px';
    if (mRatio) mRatio.textContent = item.aspectRatio + ':1';
    if (mDesc) mDesc.textContent = item.description || '精密切线与空间几何工造代表作。';

    // Extract dominant palette
    if (mSwatches) {
      mSwatches.innerHTML = '<span style="font-size:0.75rem;color:var(--text-muted);font-family:var(--font-mono);">提取中...</span>';
      extractDominantColors(item.thumb, 5, function (colors) {
        if (!modalEl.classList.contains('open')) return;
        mSwatches.innerHTML = '';
        if (!colors || colors.length === 0) return;
        colors.forEach(function (hex) {
          const btn = document.createElement('button');
          btn.className = 'meta-swatch';
          btn.title = '点击复制色彩 ' + hex;
          btn.innerHTML = '<span class="meta-swatch-dot" style="background-color: ' + hex + ';"></span>' +
                          '<span class="meta-swatch-hex">' + hex + '</span>';
          btn.addEventListener('click', function () {
            copyToClipboard(hex);
            btn.classList.add('copied');
            const hexSpan = btn.querySelector('.meta-swatch-hex');
            if (hexSpan) hexSpan.textContent = '已复制!';
            setTimeout(function () {
              btn.classList.remove('copied');
              if (hexSpan) hexSpan.textContent = hex;
            }, 1400);
          });
          mSwatches.appendChild(btn);
        });
      });
    }

    modalEl.classList.add('open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    loadOpenSeadragon(item);
  }

  function loadOpenSeadragon(item) {
    const stage = document.getElementById('osdStage');
    if (!stage) return;
    stage.innerHTML = '';

    const config = window.CANGFENG_CONFIG || {};
    const assetBase = (config.assetBaseUrl || '').replace(/\/+$/, '');

    // Clone DZI and inject assetBaseUrl if remote
    let tileSource = JSON.parse(JSON.stringify(item.dzi));
    if (assetBase) {
      tileSource.Image.Url = assetBase + '/' + tileSource.Image.Url.replace(/^\/+/, '');
    }

    const isDark = (document.documentElement.getAttribute('data-theme') !== 'light');

    try {
      osdViewer = OpenSeadragon({
        element: stage,
        prefixUrl: 'vendor/openseadragon-images/',
        showNavigationControl: false,
        showNavigator: false,
        autoResize: true,
        animationTime: 0.45,
        blendTime: 0.15,
        constrainDuringPan: true,
        maxZoomPixelRatio: 2.5,
        minZoomImageRatio: 0.8,
        visibilityRatio: 0.9,
        wrapHorizontal: false,
        wrapVertical: false,
        tileSources: tileSource,
        placeholderImage: item.thumb,
        immediateRender: true,
        crossOriginPolicy: 'Anonymous',
        backgroundColor: isDark ? '#07080b' : '#e5e8ed'
      });

      const badge = document.getElementById('toolZoomBadge');
      osdViewer.addHandler('zoom', function (e) {
        if (!badge || !osdViewer || !osdViewer.viewport) return;
        const currentZoom = osdViewer.viewport.getZoom();
        const baseZoom = osdViewer.viewport.getHomeZoom();
        const ratio = baseZoom > 0 ? (currentZoom / baseZoom) : 1;
        badge.textContent = Math.round(ratio * 100) + '%';
      });
    } catch (err) {
      console.error('OpenSeadragon init failed:', err);
      stage.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#ff5555;font-family:var(--font-mono);">' +
        '[Error] 瓦片加载失败，请检查 Cloudflare 跨域配置或图源连接。</div>';
    }
  }

  function closeViewer() {
    const modalEl = document.getElementById('viewerModal');
    if (!modalEl) return;
    modalEl.classList.remove('open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    const drawerEl = document.getElementById('viewerMetaDrawer');
    if (drawerEl) drawerEl.classList.remove('open');
    const toggleInfoBtn = document.getElementById('btnToggleInfo');
    if (toggleInfoBtn) toggleInfoBtn.classList.remove('active');

    if (osdViewer) {
      try { osdViewer.destroy(); } catch (e) {}
      osdViewer = null;
    }
    const stage = document.getElementById('osdStage');
    if (stage) stage.innerHTML = '';
  }

  /* -------------------------------------------------------------
     Palette & Helpers
     ------------------------------------------------------------- */
  function extractDominantColors(imgSrc, maxColors, callback) {
    if (!imgSrc) { callback([]); return; }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      try {
        const canvas = document.createElement('canvas');
        const size = 48;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) { callback([]); return; }
        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size).data;
        const colorBuckets = {};

        for (let i = 0; i < imgData.length; i += 16) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];
          if (a < 128) continue;
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < 16 || lum > 242) continue;

          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;
          const key = (qr << 16) | (qg << 8) | qb;
          colorBuckets[key] = (colorBuckets[key] || 0) + 1;
        }

        const sorted = Object.keys(colorBuckets).sort((a, b) => colorBuckets[b] - colorBuckets[a]);
        const result = sorted.slice(0, maxColors).map(k => {
          const val = parseInt(k, 10);
          const r = (val >> 16) & 0xff;
          const g = (val >> 8) & 0xff;
          const b = val & 0xff;
          return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
        });
        callback(result);
      } catch (e) {
        callback([]);
      }
    };
    img.onerror = () => callback([]);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  function bindAntiTheft() {
    document.addEventListener('contextmenu', (e) => {
      if (e.target.tagName === 'IMG' || e.target.closest('.osd-stage')) {
        e.preventDefault();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
