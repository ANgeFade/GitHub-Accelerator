// 【新版 background.js】

let settings = {
    enabled: false,
    mirrorUrl: 'lusiya.dpdns.org'
};

const domainMap = {
    "github.com": "gh",
    "github.io": "github-io",
    "github.community": "github-community",
    "raw.githubusercontent.com": "raw-githubusercontent-com",
    "avatars.githubusercontent.com": "avatars-githubusercontent-com",
    "assets-cdn.github.com": "assets-cdn-github-com",
    "github.githubassets.com": "github-githubassets-com",
    "cdn.jsdelivr.net": "cdn-jsdelivr-net",
    "npmjs.com": "npmjs-com",
    "github.global.ssl.fastly.net": "github-global-ssl-fastly-net",
    "api.npms.io": "api-npms-io"
};

function loadSettingsAndApply() {
    chrome.storage.sync.get(['enabled', 'mirrorUrl'], (data) => {
        settings.enabled = data.enabled ?? false;
        settings.mirrorUrl = data.mirrorUrl || 'lusiya.dpdns.org';
        updateIcon();
        updateDynamicRules();
    });
}

function updateIcon() {
    const path = settings.enabled ? {
        "16": "icons/icon16.png",
        "48": "icons/icon48.png",
        "128": "icons/icon128.png"
    } : {
        "16": "icons/icon16_disabled.png",
        "48": "icons/icon48_disabled.png",
        "128": "icons/icon128_disabled.png"
    };
    chrome.action.setIcon({ path: path });
}

async function updateDynamicRules() {
    if (!chrome.declarativeNetRequest) return;

    const allRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIds = allRules.map(rule => rule.id);
    const rulesToRemove = { removeRuleIds: ruleIds };
    
    await chrome.declarativeNetRequest.updateDynamicRules(rulesToRemove);

    if (settings.enabled && settings.mirrorUrl) {
        let newRules = [];
        let idCounter = 1;
        for (const [originalDomain, subPrefix] of Object.entries(domainMap)) {
            newRules.push({
                id: idCounter++,
                priority: 1,
                action: {
                    type: 'redirect',
                    redirect: {
                        transform: {
                            scheme: 'https',
                            host: `${subPrefix}.${settings.mirrorUrl}`
                        }
                    }
                },
                condition: {
                    requestDomains: [originalDomain],
                    resourceTypes: ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"]
                }
            });
        }
        await chrome.declarativeNetRequest.updateDynamicRules({ addRules: newRules });
    }
}

// 【核心新增1】: 监听导航事件，记录跳转信息
chrome.webNavigation.onBeforeNavigate.addListener(details => {
    if (!settings.enabled || !settings.mirrorUrl) return;

    try {
        const url = new URL(details.url);
        const originalDomain = url.hostname;
        const subPrefix = domainMap[originalDomain];

        if (subPrefix) {
            const mirrorHost = `${subPrefix}.${settings.mirrorUrl}`;
            const mirrorUrl = new URL(url);
            mirrorUrl.hostname = mirrorHost;
            
            // 存入本次跳转的“事实”
            const tabIdStr = details.tabId.toString();
            chrome.storage.local.set({
                [tabIdStr]: {
                    originalUrl: details.url,
                    mirrorUrl: mirrorUrl.href,
                    timestamp: Date.now() // 用于清理旧数据
                }
            });
        }
    } catch (e) {
        console.error("Error processing navigation:", e);
    }
});

// 【核心新增2】: 监听标签页关闭，清理记录
chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.local.remove(tabId.toString());
});

// 【核心新增3】: 监听标签页更新，如果用户导航到其他地方，也清理记录
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // 当页面加载完成或URL变化时
    if (changeInfo.status === 'complete' || changeInfo.url) {
        const tabIdStr = tabId.toString();
        chrome.storage.local.get(tabIdStr, (data) => {
            if (data[tabIdStr] && tab.url !== data[tabIdStr].mirrorUrl) {
                // 如果当前URL不是我们记录的镜像URL，说明用户已离开，清理记录
                chrome.storage.local.remove(tabIdStr);
            }
        });
    }
});


// --- Initial Setup ---
chrome.runtime.onInstalled.addListener(() => {
    loadSettingsAndApply();
    chrome.storage.sync.set({ redirectCount: 0 });
});

chrome.runtime.onStartup.addListener(() => {
    loadSettingsAndApply();
});

chrome.storage.onChanged.addListener((changes, area) => {
    // 监听设置变化以实时更新
    if (area === 'sync' && (changes.enabled || changes.mirrorUrl)) {
        loadSettingsAndApply();
    }
    // 更新加速计数
    if (area === 'sync' && changes.redirectCount) {
        chrome.action.setBadgeText({ text: changes.redirectCount.newValue.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#28a745' });
    }
});

loadSettingsAndApply();
