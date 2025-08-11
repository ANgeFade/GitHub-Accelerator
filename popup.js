// 【新版 popup.js】

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements... (no change)
    const toggleEnabled = document.getElementById('toggleEnabled');
    const statusText = document.getElementById('statusText');
    const mirrorUrlInput = document.getElementById('mirrorUrl');
    const originalUrlSpan = document.getElementById('originalUrl');
    const mirrorResultSpan = document.getElementById('mirrorResult');
    const redirectCountSpan = document.getElementById('redirectCount');
    const testBtn = document.getElementById('testBtn');

    // 正向映射表，用于“回退”诊断模式
    const proxyDomainMap = {
        "github.com": "gh.",
        // ... (rest of the map is the same)
        "avatars.githubusercontent.com": "avatars-githubusercontent-com.",
        "raw.githubusercontent.com": "raw-githubusercontent-com.",
        "assets-cdn.github.com": "assets-cdn-github-com.",
        "github.githubassets.com": "github-githubassets-com.",
        "cdn.jsdelivr.net":              "cdn.jsdelivr-net.",
        "npmjs.com":                     "npmjs-com.",
    };

    function loadSettings() {
        chrome.storage.sync.get(['enabled', 'mirrorUrl', 'redirectCount'], (data) => {
            toggleEnabled.checked = data.enabled ?? false;
            mirrorUrlInput.value = data.mirrorUrl || 'lusiya.dpdns.org';
            redirectCountSpan.textContent = data.redirectCount || 0;
            updateStatusText();
            updateUrlDisplay(); // This is the key function to change
        });
    }
    
    function updateStatusText() {
        statusText.textContent = toggleEnabled.checked ? '已启用' : '已禁用';
        statusText.style.color = toggleEnabled.checked ? '#28a745' : '#6a737d';
    }

    // 【核心重构】: 优先读取记录，否则回退到诊断模式
    function updateUrlDisplay() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0] || !tabs[0].url) {
                originalUrlSpan.textContent = '无法获取页面信息';
                mirrorResultSpan.textContent = 'N/A';
                return;
            }

            const tabIdStr = tabs[0].id.toString();
            const currentUrl = new URL(tabs[0].url);

            // 1. 尝试从storage获取“事实记录”
            chrome.storage.local.get(tabIdStr, (data) => {
                if (data && data[tabIdStr] && data[tabIdStr].mirrorUrl === currentUrl.href) {
                    // 【理想情况】: 找到了记录，且当前URL就是记录中的镜像URL
                    const record = data[tabIdStr];
                    originalUrlSpan.textContent = formatUrlForDisplay(new URL(record.originalUrl));
                    mirrorResultSpan.textContent = formatUrlForDisplay(new URL(record.mirrorUrl));

                } else {
                    // 【回退模式】: 没找到记录，或记录已过时，执行诊断
                    fallbackDisplay(currentUrl);
                }
            });
        });
    }

    // “诊断”模式的逻辑，作为回退方案
    function fallbackDisplay(currentUrl) {
        const mirrorHost = mirrorUrlInput.value.trim();
        const currentHost = currentUrl.hostname;

        // "原始URL" 忠实报告当前URL
        originalUrlSpan.textContent = formatUrlForDisplay(currentUrl);

        // "镜像URL" 进行状态说明
        if (mirrorHost && currentHost.endsWith(mirrorHost)) {
            mirrorResultSpan.textContent = "当前已是镜像页";
        } else if (proxyDomainMap[currentHost] && mirrorHost) {
            const prefix = proxyDomainMap[currentHost];
            const mirrorPreviewUrl = new URL(currentUrl);
            mirrorPreviewUrl.hostname = prefix + mirrorHost;
            mirrorResultSpan.textContent = formatUrlForDisplay(mirrorPreviewUrl);
        } else {
            mirrorResultSpan.textContent = "非加速域名";
        }
    }

    function formatUrlForDisplay(urlObject) {
       try {
            const host = urlObject.hostname;
            const path = urlObject.pathname + urlObject.search + urlObject.hash;
            const shortPath = path.length > 30 ? `${path.substring(0, 30)}...` : path;
            return `${host}${shortPath}`;
        } catch (e) {
            return "无效的URL";
        }
    }
    
    // --- Event Listeners (无改动) ---
    toggleEnabled.addEventListener('change', () => { /* ... */ });
    mirrorUrlInput.addEventListener('blur', () => { /* ... */ });
    mirrorUrlInput.addEventListener('input', updateUrlDisplay);
    testBtn.addEventListener('click', () => { /* ... */ });
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync' && changes.redirectCount) {
            redirectCountSpan.textContent = changes.redirectCount.newValue;
        }
    });

    loadSettings();
});

// 在 `toggleEnabled.addEventListener`, `mirrorUrlInput.addEventListener('blur')` 中补全内部逻辑
// ... (此处省略与之前版本相同的事件监听器代码，请直接使用您已有的代码填充)
// 例如:
toggleEnabled.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: toggleEnabled.checked });
    updateStatusText();
});
mirrorUrlInput.addEventListener('blur', () => {
    const mirrorUrl = mirrorUrlInput.value.trim();
     chrome.storage.sync.set({ mirrorUrl: mirrorUrl });
});
testBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/ANgeFade' });
});
