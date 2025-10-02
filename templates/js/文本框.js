// Function to inject CSS into the document head
function addCss(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

// CSS for the textarea
const textareaCss = `
.enter-textarea {
    overflow-y: hidden; /* 隐藏滚动条 */
    resize: none; /* 禁止用户手动调整大小 */
    width: 5ch; /* 默认宽度为5个字符 */
    min-width: 10ch; /* 最小宽度 */
    box-sizing: border-box;
    padding: 5px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    line-height: 1.5;
}
`;

// Inject the CSS as soon as the script is loaded
addCss(textareaCss);

document.addEventListener('DOMContentLoaded', function () {
    const textareas = document.querySelectorAll('.enter-textarea');

    function autoResizeHeight(textarea) {
        textarea.style.height = '0'; // Reset height to recalculate
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    function autoResizeWidth(textarea) {
        // Create a temporary span to measure the text width
        const span = document.createElement('span');
        span.style.visibility = 'hidden';
        span.style.position = 'absolute';
        span.style.whiteSpace = 'pre'; // Preserve spaces and line breaks for measurement
        span.style.font = window.getComputedStyle(textarea).font;
        document.body.appendChild(span);

        // Find the longest line to set the width
        const lines = textarea.value.split('\n');
        let longestLine = '';
        lines.forEach(line => {
            if (line.length > longestLine.length) {
                longestLine = line;
            }
        });

        // Use the longest line or the placeholder to determine width
        span.textContent = longestLine || textarea.placeholder || '';
        
        // Set textarea width, respecting min-width. Add a small buffer.
        const newWidth = span.offsetWidth + 2; // +2 for buffer
        textarea.style.width = newWidth + 'px';

        // Clean up the temporary span
        document.body.removeChild(span);
    }

    function autoResize(textarea) {
        autoResizeHeight(textarea);
        autoResizeWidth(textarea);
    }

    textareas.forEach(textarea => {
        // Initial resize on page load for all textareas
        autoResize(textarea);

        // Resize on input
        textarea.addEventListener('input', () => {
            autoResize(textarea);
        });
    });
});