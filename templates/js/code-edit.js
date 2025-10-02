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
  });
  