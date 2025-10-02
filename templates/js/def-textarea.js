// 获取 def-textarea 文本框元素
const defTextarea = document.querySelector('.def-textarea');

if (defTextarea) {
    // 设置行高为1个字符高度
    defTextarea.style.lineHeight = '1em';
    // 设置显示行数为1行
    defTextarea.rows = 1;
    // 可选：设置最小高度为1行
    defTextarea.style.minHeight = '1em';
    // 禁用左右调整大小（完全禁用调整大小）
    defTextarea.style.resize = 'none';
    // 设置 CSS 属性
    defTextarea.style.overflow = 'hidden';
    defTextarea.style.whiteSpace = 'nowrap';
    // 声明性属性：标记为单行
    defTextarea.setAttribute('rows', '1');
    defTextarea.setAttribute('wrap', 'off');
    defTextarea.setAttribute('data-single-line', 'true');
    defTextarea.setAttribute('aria-multiline', 'false');
    // 使用 border-box，随着内容增减始终保持文本与右边框的相对距离稳定
    defTextarea.style.boxSizing = 'border-box';

    // 基于镜像元素的自适应宽度，避免 canvas 测量导致的视觉偏差
    function adjustWidthUsingMirror() {
        const sh = getComputedStyle(defTextarea);
        // 构造镜像元素
        const mirror = document.createElement('div');
        mirror.style.position = 'absolute';
        mirror.style.visibility = 'hidden';
        mirror.style.whiteSpace = 'pre';
        mirror.style.top = '-9999px';
        mirror.style.left = '-9999px';
        mirror.style.display = 'inline-block';
        // 复制与宽度相关的样式
        mirror.style.font = sh.font;
        mirror.style.letterSpacing = sh.letterSpacing;
        mirror.style.padding = sh.padding; // 让 offsetWidth 包含 padding
        mirror.style.border = sh.border;   // 让 offsetWidth 包含 border
        mirror.style.boxSizing = 'border-box';
        // 同步占位符逻辑
        const text = (defTextarea.value || defTextarea.placeholder || ' ')
            .replace(/[\r\n]/g, '');
        mirror.textContent = text;
        // 将 mirror 放入文档后测量
        document.body.appendChild(mirror);
        const measured = mirror.offsetWidth; // 已含 padding + border
        document.body.removeChild(mirror);
        // 设定最终宽度
        const minPx = 30; // 最小宽度
        defTextarea.style.maxWidth = '100%';
        defTextarea.style.width = Math.max(measured, minPx) + 'px';
    }

    // ========== Python 文本名校验与高亮 ========== 
    // 规则：Python 标识符（变量/函数名）: ^[A-Za-z_][A-Za-z0-9_]*$
    // 如需支持模块路径（允许点号），可将 isValidChar 替换为允许 '.' 并在首段规则上分段校验。
    let overlay = null;
    function ensureOverlay() {
        const parent = defTextarea.parentElement || document.body;
        // 确保父容器为定位上下文
        const cps = getComputedStyle(parent);
        if (cps.position === 'static') parent.style.position = 'relative';
        if (overlay && parent.contains(overlay)) return overlay;
        overlay = document.createElement('div');
        overlay.style.position = 'absolute';
        overlay.style.pointerEvents = 'none';
        overlay.style.whiteSpace = 'pre';
        overlay.style.overflow = 'hidden';
        overlay.style.zIndex = '1';
        parent.appendChild(overlay);
        return overlay;
    }
    function htmlEscape(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    // 使用 Unicode 属性类别，允许中文等 Unicode 字符
    const START_RE = /^[\p{L}_]$/u;            // 字母或下划线
    const CONT_RE  = /^[\p{L}\p{N}_]$/u;      // 字母、数字或下划线
    function isStartChar(ch) {
        return START_RE.test(ch);
    }
    function isValidChar(ch) {
        return CONT_RE.test(ch);
    }
    function buildHighlightedHtml(text) {
        if (!text) return '';
        const arr = [];
        let index = 0;
        for (const ch of text) { // 按代码点遍历
            const esc = ch === ' ' ? '&nbsp;' : htmlEscape(ch);
            const isSpace = (ch === ' ');
            const ok = index === 0 ? isStartChar(ch) : isValidChar(ch);
            if (ok) {
                // 合法：透明文字用于占位（独立盒子避免背景延伸）
                arr.push('<span style="display:inline-block; line-height:inherit; color:transparent' + (isSpace ? '; width:1ch' : '') + '">' + esc + '</span>');
            } else {
                // 非法：仅当前字符背景标红（独立盒子贴合字符宽度）
                arr.push('<span style="display:inline-block; line-height:inherit; color:transparent' + (isSpace ? '; width:1ch' : '') + '; background-color: rgba(229, 57, 53, 0.35); border-radius:2px">' + esc + '</span>');
            }
            index += 1;
        }
        return arr.join('');
    }
    function updateOverlay() {
        const el = ensureOverlay();
        const sh = getComputedStyle(defTextarea);
        // 定位与尺寸（与 textarea 同父容器，使用 offset*）
        el.style.left = defTextarea.offsetLeft + 'px';
        el.style.top = defTextarea.offsetTop + 'px';
        el.style.width = defTextarea.offsetWidth + 'px';
        el.style.height = defTextarea.offsetHeight + 'px';
        // 字体与排版匹配
        el.style.font = sh.font;
        el.style.letterSpacing = sh.letterSpacing;
        el.style.lineHeight = sh.lineHeight;
        el.style.paddingTop = sh.paddingTop;
        el.style.paddingRight = sh.paddingRight;
        el.style.paddingBottom = sh.paddingBottom;
        el.style.paddingLeft = sh.paddingLeft;
        // 边框不渲染，使用原 textarea 的边框即可
        // 内容：仅渲染非法字符为红色，其余透明以对齐；并根据滚动进行反向平移
        const text = (defTextarea.value || '').replace(/[\r\n]/g, '');
        const sx = defTextarea.scrollLeft || 0;
        const sy = defTextarea.scrollTop || 0;
        el.innerHTML = '<div style="transform:translate(' + (-sx) + 'px,' + (-sy) + 'px); will-change: transform;">'
            + buildHighlightedHtml(text) + '</div>';
    }

    // 使用 rAF 监视位置/尺寸/滚动变化，覆盖非滚动触发的布局变更
    let _rafId = 0;
    const _boxState = { l: 0, t: 0, w: 0, h: 0, sx: 0, sy: 0 };
    function _tick() {
        const r = defTextarea.getBoundingClientRect();
        const sx = defTextarea.scrollLeft || 0;
        const sy = defTextarea.scrollTop || 0;
        if (r.left !== _boxState.l || r.top !== _boxState.t || r.width !== _boxState.w || r.height !== _boxState.h || sx !== _boxState.sx || sy !== _boxState.sy) {
            _boxState.l = r.left; _boxState.t = r.top; _boxState.w = r.width; _boxState.h = r.height; _boxState.sx = sx; _boxState.sy = sy;
            updateOverlay();
        }
        _rafId = window.requestAnimationFrame(_tick);
    }

    // 监听祖先容器的滚动，确保覆盖层在任何滚动场景下同步
    function attachAncestorScrollListeners() {
        let p = defTextarea.parentElement;
        let depth = 0;
        while (p && depth < 8) {
            p.addEventListener('scroll', updateOverlay, { passive: true });
            p = p.parentElement;
            depth++;
        }
    }

    // 彻底禁止换行
    // 1) 在 beforeinput 阶段阻止插入换行（含部分输入法、系统行为）
    defTextarea.addEventListener('beforeinput', function (e) {
        // insertLineBreak: 回车插入换行；insertParagraph: 某些浏览器的段落插入
        if (e.inputType === 'insertLineBreak' || e.inputType === 'insertParagraph') {
            e.preventDefault();
            return;
        }
        // 某些场景 data 里会带换行
        if (typeof e.data === 'string' && /[\r\n]/.test(e.data)) {
            e.preventDefault();
        }
        // 同步高亮
        setTimeout(updateOverlay, 0);
    });

    // 2) 键盘输入阶段拦截 Enter（含组合键）
    defTextarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault();
            return false;
        }
    });

    // 3) 粘贴时净化，去除所有换行并光标处插入
    defTextarea.addEventListener('paste', function (e) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const clean = String(text).replace(/[\r\n]/g, '');
        // 优先使用 setRangeText（标准方式）
        if (typeof this.setRangeText === 'function') {
            const start = this.selectionStart;
            const end = this.selectionEnd;
            this.setRangeText(clean, start, end, 'end');
        } else if (document.execCommand) {
            // 兼容旧环境
            document.execCommand('insertText', false, clean);
        } else {
            // 最兜底：直接拼接
            const start = this.selectionStart;
            const end = this.selectionEnd;
            const v = this.value;
            this.value = v.slice(0, start) + clean + v.slice(end);
            const pos = start + clean.length;
            this.selectionStart = this.selectionEnd = pos;
        }
        // 粘贴后更新高亮
        updateOverlay();
    });

    // 4) 兜底清理：任何情况下出现换行都立即移除，同时保持光标位置合理
    defTextarea.addEventListener('input', function () {
        const pos = this.selectionStart;
        const before = this.value;
        const after = before.replace(/[\r\n]/g, '');
        if (before !== after) {
            const diff = before.length - after.length;
            this.value = after;
            this.selectionStart = this.selectionEnd = Math.max(0, pos - diff);
        }
        adjustWidthUsingMirror();
        updateOverlay();
    });

    // 初始化与窗口尺寸变化时更新
    adjustWidthUsingMirror();
    updateOverlay();
    window.addEventListener('resize', function(){
        adjustWidthUsingMirror();
        updateOverlay();
    });
    // 页面滚动或容器滚动时，保持覆盖层位置正确
    window.addEventListener('scroll', updateOverlay, { passive: true, capture: true });
    document.addEventListener('scroll', updateOverlay, { passive: true, capture: true });
    // 文本框自身滚动（水平/垂直）时，同步覆盖层内容位置
    defTextarea.addEventListener('scroll', updateOverlay);
    // 监听祖先滚动
    attachAncestorScrollListeners();

    // 监听尺寸变更，处理布局变化
    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => updateOverlay());
        ro.observe(defTextarea);
        const parent = defTextarea.parentElement;
        if (parent) ro.observe(parent);
    }
}
