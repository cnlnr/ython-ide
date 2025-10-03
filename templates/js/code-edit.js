// 让 .code-edit 内容不超出容器，但可左右滚动查看
document.addEventListener('DOMContentLoaded', function () {
    const blocks = document.querySelectorAll('.code-edit');
    blocks.forEach(el => {
      el.style.display = 'block';
      el.style.maxWidth = '100%';
      el.style.whiteSpace = 'pre';      // 单行保持、按空白精确渲染
      el.style.overflowX = 'auto';      // 横向滚动
      el.style.overflowY = 'hidden';    // 纵向不滚动（可按需改为 auto）
      // 范围框
      el.style.boxSizing = 'border-box';
      el.style.border = '2px solid rgba(20, 20, 20, 1)';
      el.style.borderRadius = '8px';
      el.style.padding = '8px 12px';
    });
  
    // 可选增强：滚轮上下滚动时转为横向滚动
    blocks.forEach(el => {
      el.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          el.scrollLeft += e.deltaY;
          e.preventDefault();
        }
      }, { passive: false });
    });

    // =========================
    // 仅作用于 .code-edit 标签内的缩放（无按钮）
    // =========================
    const ZOOM_MIN = 0.5;
    const ZOOM_MAX = 3;
    const ZOOM_STEP = 0.1;

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    // 初始化各块的缩放数据
    blocks.forEach(el => {
      if (!el.dataset.zoom) el.dataset.zoom = '1';
      // 使用 CSS zoom 简化（Chromium/Edge 支持良好）。如需更广泛兼容可改为 transform: scale。
      el.style.zoom = el.dataset.zoom;
      el.style.transformOrigin = 'top left';
    });

    const getZoom = (el) => Number(el.dataset.zoom || '1');
    const setZoom = (el, z) => {
      const v = Number(clamp(Number(z), ZOOM_MIN, ZOOM_MAX).toFixed(2));
      el.dataset.zoom = String(v);
      el.style.zoom = String(v);
    };

    // 记录当前活跃（悬停/聚焦）的 .code-edit
    let activeBlock = null;
    const activate = (el) => { activeBlock = el; };
    blocks.forEach(el => {
      el.addEventListener('mouseenter', () => activate(el));
      el.addEventListener('mousemove', () => activate(el));
      el.addEventListener('focusin', () => activate(el));
    });

    // 键盘快捷键仅在目标处于 .code-edit 内时生效
    document.addEventListener('keydown', (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (!isCtrl) return;

      // 优先使用当前聚焦元素所在块，否则使用最近悬停块
      const focusedBlock = (document.activeElement && document.activeElement.closest) ? document.activeElement.closest('.code-edit') : null;
      const target = focusedBlock || activeBlock;
      if (!target) return;

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(target, getZoom(target) + ZOOM_STEP);
      } else if (e.key === '-') {
        e.preventDefault();
        setZoom(target, getZoom(target) - ZOOM_STEP);
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(target, 1);
      }
    }, { capture: true });

    // 仅当在 .code-edit 区域内并按住 Ctrl/Meta 才拦截滚轮并缩放该块
    blocks.forEach(el => {
      el.addEventListener('wheel', (e) => {
        if (!(e.ctrlKey || e.metaKey)) return; // 只在按住 Ctrl/⌘ 时缩放
        e.preventDefault();
        activate(el);
        if (e.deltaY > 0) {
          setZoom(el, getZoom(el) - ZOOM_STEP);
        } else if (e.deltaY < 0) {
          setZoom(el, getZoom(el) + ZOOM_STEP);
        }
      }, { passive: false });
    });
  });
