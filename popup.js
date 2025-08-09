document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element Selection ---
  const toggleEnabled = document.getElementById('toggleEnabled');
  const statusText = document.getElementById('statusText');
  const mirrorUrlInput = document.getElementById('mirrorUrl');
  const timeoutInput = document.getElementById('timeoutInput');
  const originalUrlSpan = document.getElementById('originalUrl');
  const mirrorResultSpan = document.getElementById('mirrorResult');
  const redirectCountSpan = document.getElementById('redirectCount');
  const testBtn = document.getElementById('testBtn'); // 【修改点】ID已改回 testBtn

  const settings = {};

  // --- Functions ---
  
  // 从存储加载设置并更新UI
  function loadSettings() {
    chrome.storage.sync.get(['enabled', 'mirrorUrl', 'timeout', 'redirectCount'], (data) => {
      settings.enabled = data.enabled || false;
      settings.mirrorUrl = data.mirrorUrl || '';
      settings.timeout = data.timeout || 3000;
      settings.redirectCount = data.redirectCount || 0;
      
      toggleEnabled.checked = settings.enabled;
      mirrorUrlInput.value = settings.mirrorUrl;
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
                mirrorResultSpan.textContent = `${mirrorHost}${shortPath}`;
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

  // 【修改点】监听 testBtn 的点击事件
  testBtn.addEventListener('click', () => {
    // 这行代码会尝试在新标签页中打开你的 GitHub 主页
    // 如果插件的重定向规则生效，浏览器会自动把它重定向到镜像站点
    // 从而完美地测试了核心功能
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
