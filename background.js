// 全局设置变量，用于在内存中缓存状态
let currentSettings = {
    enabled: false,
    mirrorUrl: '',
    redirectCount: 0
};

// 【新增】后端服务器支持的域名映射配置
// 键为原始域名，值为镜像前缀
const proxyDomainMap = {
    "github.com":                    "gh.",
    "avatars.githubusercontent.com": "avatars-githubusercontent-com.",
    "github.githubassets.com":       "github-githubassets-com.",
    "collector.github.com":          "collector-github-com.",
    "api.github.com":                "api-github-com.",
    "raw.githubusercontent.com":     "raw-githubusercontent-com.",
    "gist.githubusercontent.com":    "gist-githubusercontent-com.",
    "github.io":                     "github-io.",
    "assets-cdn.github.com":         "assets-cdn-github-com.",
    "cdn.jsdelivr.net":              "cdn.jsdelivr-net.",
    "securitylab.github.com":        "securitylab-github-com.", // 保持与 Go 代码一致，即使它看起来不太规范
    "www.githubstatus.com":          "www-githubstatus-com.",
    "npmjs.com":                     "npmjs-com.",
    "git-lfs.github.com":            "git-lfs-github-com.",
    "githubusercontent.com":         "githubusercontent-com.",
    "github.global.ssl.fastly.net":  "github-global-ssl-fastly-net.",
    "api.npms.io":                   "api-npms-io.",
    "github.community":              "github-community."
};

// 【新增】生成所有重定向规则的ID，用于批量添加和移除
const ALL_PROXY_RULE_IDS = Object.keys(proxyDomainMap).map((_, i) => i + 1);

// --- 初始化 ---
chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

function initialize() {
    chrome.storage.sync.get(['enabled', 'mirrorUrl', 'redirectCount'], (result) => {
        currentSettings.enabled = result.enabled || false;
        currentSettings.mirrorUrl = result.mirrorUrl || '';
        currentSettings.redirectCount = result.redirectCount || 0;
        
        console.log('GitHub Accelerator Initialized/Updated. Current settings:', currentSettings);
        
        updateRules(); // 根据加载的设置更新规则
        updateIcon();  // 根据加载的设置更新图标
    });
}

// --- 核心功能 ---
// 1. 更新网络重定向规则
function updateRules() {
    const rulesToAdd = [];

    // 只有当扩展启用且镜像URL有效时才添加规则
    if (currentSettings.enabled && currentSettings.mirrorUrl && currentSettings.mirrorUrl.trim() !== '') {
        let ruleId = 1;
        for (const originalDomain in proxyDomainMap) {
            const proxyPrefix = proxyDomainMap[originalDomain];
            // 目标重定向主机名：组合 "代理前缀" + "用户设置的镜像URL"
            const targetRedirectionHost = proxyPrefix + currentSettings.mirrorUrl; 

            rulesToAdd.push({
                id: ruleId++, // 唯一的规则ID
                priority: 1, // 优先级
                action: {
                    type: 'redirect',
                    redirect: {
                        scheme: 'https', // 强制使用 HTTPS
                        host: targetRedirectionHost // 重定向到计算出的目标主机
                    }
                },
                condition: {
                    requestDomains: [originalDomain], // 匹配原始域名
                    resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image', 'stylesheet', 'object', 'other']
                }
            });
        }
        console.log(`Prepared ${rulesToAdd.length} redirection rules for various GitHub domains.`);
    } else {
        console.log('Extension disabled, mirror URL not set, or mirror URL is empty. All dynamic rules will be removed.');
    }

    // 无论是否添加新规则，都先移除所有旧的动态规则，再添加新的
    // 这样确保了规则的原子性更新，避免残留旧规则或规则冲突
    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: ALL_PROXY_RULE_IDS, // 移除所有可能存在的规则ID
        addRules: rulesToAdd
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error updating rules:', chrome.runtime.lastError.message);
        } else {
            console.log('Dynamic redirection rules updated successfully.');
        }
    });
}

// 2. 更新浏览器动作图标 (逻辑不变)
function updateIcon() {
    const isActive = currentSettings.enabled && currentSettings.mirrorUrl && currentSettings.mirrorUrl.trim() !== '';
    const iconPaths = {
        "16": isActive ? "icons/icon16.png" : "icons/icon16_disabled.png",
        "48": isActive ? "icons/icon48.png" : "icons/icon48_disabled.png",
        "128": isActive ? "icons/icon128.png" : "icons/icon128_disabled.png"
    };
    chrome.action.setIcon({ path: iconPaths });
}

// 3. 监听重定向成功事件以更新计数器
chrome.webNavigation.onCompleted.addListener(details => {
    // 确保是主框架导航，并且URL的hostname符合镜像的模式 (e.g., gh.kgithub.com, avatars-githubusercontent-com.kgithub.com)
    if (details.frameId === 0 && currentSettings.mirrorUrl && currentSettings.mirrorUrl.trim() !== '') {
        try {
            const url = new URL(details.url);
            // 检查当前URL的主机名是否以用户设置的镜像URL结尾
            if (url.hostname.endsWith(currentSettings.mirrorUrl)) {
                // 进一步检查主机名是否与任何一个预设的代理前缀匹配
                const foundMatch = Object.values(proxyDomainMap).some(prefix => {
                    return url.hostname === (prefix + currentSettings.mirrorUrl);
                });

                if (foundMatch) {
                    const newCount = (currentSettings.redirectCount || 0) + 1;
                    currentSettings.redirectCount = newCount;
                    chrome.storage.sync.set({ redirectCount: newCount });
                }
            }
        } catch (e) {
            console.warn("Could not parse URL for stats:", details.url, e);
        }
    }
}, { url: [{ schemes: ["https", "http"] }] }); // 监听所有HTTP/HTTPS导航

// --- 监听器 ---
// 监听来自 popup 的存储变化 (逻辑不变)
chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;

    let needsRuleUpdate = false;
    let needsIconUpdate = false;

    if (changes.enabled !== undefined) {
        currentSettings.enabled = changes.enabled.newValue;
        needsRuleUpdate = true;
        needsIconUpdate = true;
    }
    if (changes.mirrorUrl !== undefined) {
        currentSettings.mirrorUrl = changes.mirrorUrl.newValue;
        // 只有当 mirrorUrl 实际改变时才触发更新，避免不必要的规则刷新
        if (changes.mirrorUrl.oldValue !== changes.mirrorUrl.newValue) {
            needsRuleUpdate = true;
            needsIconUpdate = true;
        }
    }
    if (changes.redirectCount !== undefined) {
        currentSettings.redirectCount = changes.redirectCount.newValue;
    }

    if (needsRuleUpdate) {
        updateRules();
    }
    if (needsIconUpdate) {
        updateIcon();
    }
});
