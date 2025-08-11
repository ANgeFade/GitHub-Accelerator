document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element Selection ---
  const toggleEnabled = document.getElementById('toggleEnabled');
  const statusText = document.getElementById('statusText');
  const mirrorUrlInput = document.getElementById('mirrorUrl');
  const timeoutInput = document.getElementById('timeoutInput');
  const originalUrlSpan = document.getElementById('originalUrl');
  const mirrorResultSpan = document.getElementById('mirrorResult');
  const redirectCountSpan = document.getElementById('redirectCount');
  const testBtn = document.getElementById('testBtn');

  // 注意：这里用 let 而不是 const，因为 settings 的属性会被修改
  const settings = {};

  // --- Functions ---
  
  // 从存储加载设置并更新UI
  function loadSettings() {
    chrome.storage.sync.get(['enabled', 'mirrorUrl', 'timeout', 'redirectCount'], (data) => {
      settings.enabled = data.enabled || false;
      // *** 核心修改点：在这里设置默认的镜像地址 ***
      settings.mirrorUrl = data.mirrorUrl || 'lusiya.dpdns.org'; 
      settings.timeout = data.timeout || 3000;
      settings.redirectCount = data.redirectCount || 0;
      
      toggleEnabled.checked = settings.enabled;
      mirrorUrlInput.value = settings.mirrorUrl; // 这里会使用上面设置好的 settings.mirrorUrl 值
      timeoutInput.value = settings.timeout;
      redirectCountSpan.textContent = settings.redirectCount;
      updateStatusText();
      updateUrlDisplay();
    });
  }
  
  // 更新状态文本
  function updateStatusText() {
    statusText.textContent = toggleEnabled.checked ? '已启用' : '已禁用';
  }

  // 更新URL预览
  function updateUrlDisplay() {
    const mirrorHost = mirrorUrlInput.value.trim();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url && tabs[0].url.includes('github.com')) {
            const currentUrl = new URL(tabs[0].url);
            const shortPath = currentUrl.pathname.length > 20 ? `${currentUrl.pathname.substring(0, 20)}...` : currentUrl.pathname;
            originalUrlSpan.textContent = `${currentUrl.hostname}${shortPath}`;

            if (mirrorHost) {
                // 如果当前页面是 GitHub 域名，且有设置镜像地址，则显示预览
                // 假设 github.com -> gh.lusiya.dpdns.org
                let previewHost = mirrorHost;
                if (currentUrl.hostname === 'github.com') { // 专门针对 github.com 做预览
                    previewHost = `gh.${mirrorHost}`; 
                } else if (currentUrls.hostname.includes('githubusercontent.com')) { // 对 usercontent 域名做预览
                    const domainParts = currentUrl.hostname.split('.');
                    // 假设 `raw.githubusercontent.com` -> `raw-githubusercontent-com`
                    const transformedDomain = domainParts.join('-').replace(/\./g, '-');
                    previewHost = `${transformedDomain}.${mirrorHost}`;
                }
                // 这里的预览功能为了简化，不完全模拟所有 `proxyDomainMap` 中的复杂逻辑
                // 它只是一个指示，说明会重定向到您的镜像服务上
                mirrorResultSpan.textContent = `${previewHost}${shortPath}`;
            } else {
                mirrorResultSpan.textContent = '请先设置镜像地址';
            }
        } else {
            originalUrlSpan.textContent = '非GitHub页面';
            mirrorResultSpan.textContent = 'N/A';
        }
    });
  }

  // --- Event Listeners ---
  
  toggleEnabled.addEventListener('change', () => {
    settings.enabled = toggleEnabled.checked;
    chrome.storage.sync.set({ enabled: settings.enabled });
    updateStatusText();
  });
  
  mirrorUrlInput.addEventListener('input', () => {
    const mirrorUrl = mirrorUrlInput.value.trim();
    if (settings.mirrorUrl !== mirrorUrl) {
      settings.mirrorUrl = mirrorUrl;
      chrome.storage.sync.set({ mirrorUrl: settings.mirrorUrl });
      updateUrlDisplay();
    }
  });

  timeoutInput.addEventListener('input', () => {
    const timeout = parseInt(timeoutInput.value, 10);
    if (!isNaN(timeout) && timeout >= 500 && timeout <= 10000) {
      if (settings.timeout !== timeout) {
        settings.timeout = timeout;
        chrome.storage.sync.set({ timeout: settings.timeout });
      }
    }
  });

  testBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/ANgeFade' });
  });

  chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.redirectCount) {
          redirectCountSpan.textContent = changes.redirectCount.newValue;
      }
  });
  
  // --- Initial Load ---
  loadSettings();
});
