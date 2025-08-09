// 全局设置变量，用于在内存中缓存状态，减少对存储的频繁读取
let currentSettings = {
    enabled: false,
    mirrorUrl: '',
    redirectCount: 0
};

// --- 初始化 ---
// 插件首次安装或浏览器启动时，从存储加载配置
chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

function initialize() {
    chrome.storage.sync.get(['enabled', 'mirrorUrl', 'redirectCount'], (result) => {
        currentSettings.enabled = result.enabled || false;
        currentSettings.mirrorUrl = result.mirrorUrl || '';
        currentSettings.redirectCount = result.redirectCount || 0;
        
        console.log('GitHub Accelerator Initialized/Updated. Current settings:', currentSettings);
        
        updateRules();
        updateIcon();
    });
}

// --- 核心功能 ---
// 1. 更新网络重定向规则
function updateRules() {
    const RULE_ID = 1;
    const rulesToRemove = [RULE_ID];
    const rulesToAdd = [];

    if (currentSettings.enabled && currentSettings.mirrorUrl) {
        rulesToAdd.push({
            id: RULE_ID,
            priority: 1,
            action: {
                type: 'redirect',
                redirect: {
                    transform: { scheme: 'https', host: currentSettings.mirrorUrl }
                }
            },
            condition: {
                requestDomains: ["github.com"], 
                resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image', 'stylesheet', 'object', 'other']
            }
        });
        console.log(`Redirect rule created for: ${currentSettings.mirrorUrl}`);
    } else {
        console.log('Extension is disabled or mirror URL is not set. Removing redirect rules.');
    }

    chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: rulesToRemove,
        addRules: rulesToAdd
    }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error updating rules:', chrome.runtime.lastError);
        }
    });
}

// 2. 更新浏览器动作图标
function updateIcon() {
    const isActive = currentSettings.enabled && currentSettings.mirrorUrl;
    const iconPaths = {
        "16": isActive ? "icons/icon16.png" : "icons/icon16_disabled.png",
        "48": isActive ? "icons/icon48.png" : "icons/icon48_disabled.png",
        "128": isActive ? "icons/icon128.png" : "icons/icon128_disabled.png"
    };
    chrome.action.setIcon({ path: iconPaths });
}

// 3. 监听重定向成功事件以更新计数器
chrome.webNavigation.onCompleted.addListener(details => {
    // 确保是主框架导航，并且URL匹配镜像地址
    if (details.frameId === 0 && currentSettings.mirrorUrl) {
        try {
            const url = new URL(details.url);
            if (url.hostname === currentSettings.mirrorUrl) {
                const newCount = (currentSettings.redirectCount || 0) + 1;
                currentSettings.redirectCount = newCount;
                chrome.storage.sync.set({ redirectCount: newCount });
            }
        } catch (e) {
            console.warn("Could not parse URL for stats:", details.url);
        }
    }
}, { url: [{ schemes: ["https", "http"] }] });

// --- 监听器 ---
// 监听来自 popup 的设置变更
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
        needsRuleUpdate = true;
        needsIconUpdate = true;
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
