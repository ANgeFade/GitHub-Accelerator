#!/bin/bash

# ==============================================================================
# GitHub Proxy-Go-Accelerator 自动化部署脚本 (V3 - 编译修复版)
#
# GitHub-Proxy-Go-Accelerator Automatic Deployment Script (V3 - Compilation-Fixed)
#
# 角色 (Role): 资深软件工程师 (Senior Software Engineer)
# 变更 (Changes):
#   - 使用 cat << 'EOF' 结合 sed 来生成 Go 代码，彻底解决 Bash 转义问题。
#     Uses `cat << 'EOF'` with `sed` to generate Go code, fixing all Bash escaping issues.
#   - 修复了端口占用检查后未立即退出的逻辑错误。
#     Fixed a logic bug where the script continued after detecting a used port.
#
# 使用方法 (Usage):
#   bash install.sh         (执行安装 / Run installation)
#   bash install.sh uninstall (执行卸载 / Run uninstallation)
# ==============================================================================
#版权声明：代码来自2x.nz，GitHub/ANgeFade为浏览器拓展配套.
# 脚本安全设置
set -e
set -o pipefail

# ... (全局变量、颜色定义、语言文本等保持不变，此处省略)
# --- 全局变量和颜色定义 (Global Variables & Color Definitions) ---
GO_VERSION="1.21.5"
GO_URL="https://golang.google.cn/dl/go${GO_VERSION}.linux-amd64.tar.gz"
GO_INSTALL_DIR="/usr/local"
GO_BIN_PATH="${GO_INSTALL_DIR}/go/bin/go"

C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BLUE='\033[0;34m'

# --- 文本本地化 (Text Localization) ---
# ... (内容和之前一样)
# 中文文本
TXT_CN_CHOOSE_LANG="请选择语言 (Please select language) [1.中文 2.English]: "
TXT_CN_REQUIRE_ROOT="错误：本脚本需要以 root 权限运行。"
TXT_CN_INSTALL_DIR_PROMPT="请输入安装目录 (默认: /opt/github-proxy): "
TXT_CN_PROXY_PORT_PROMPT="请输入代理端口 (默认: 11258): "
TXT_CN_PROXY_DOMAIN_PROMPT="请输入您的加速域名 (注：不需要加gh前缀): "
TXT_CN_DOMAIN_EMPTY="错误：加速域名不能为空。"
TXT_CN_PORT_IN_USE="错误：端口 %s 已被占用。请选择其他端口。"
TXT_CN_CHECKING_DEPS="正在检查基础依赖 (wget, tar)..."
TXT_CN_DEPS_OK="基础依赖满足。"
TXT_CN_CHECKING_GO="正在检查 Go 环境..."
TXT_CN_GO_FOUND="检测到 Go 环境: %s"
TXT_CN_GO_NOT_FOUND="未检测到 Go 环境。正在为您自动安装 Go ${GO_VERSION}..."
TXT_CN_DOWNLOADING_GO="正在从 %s 下载 Go..."
TXT_CN_INSTALLING_GO="正在安装 Go 到 ${GO_INSTALL_DIR}..."
TXT_CN_CONFIGURING_GO_PATH="正在配置 Go 环境变量..."
TXT_CN_GO_INSTALL_SUCCESS="Go 安装并配置成功。"
TXT_CN_CREATING_DIR="正在创建安装目录: %s"
TXT_CN_WRITING_FILES="正在写入 main.go 和 go.mod..."
TXT_CN_COMPILING="正在编译应用程序..." 
TXT_CN_COMPILE_SUCCESS="应用程序编译成功。"
TXT_CN_CREATING_SERVICE="正在创建 systemd 服务: github-proxy.service"
TXT_CN_STARTING_SERVICE="正在启动并设置开机自启..."
TXT_CN_VERIFYING_SERVICE="正在验证服务状态..."
TXT_CN_INSTALL_SUCCESS="恭喜！GitHub 加速代理搭建成功！"
TXT_CN_INSTALL_SUCCESS_DETAILS="  - 运行端口 (Port): %s\n  - 加速域名 (Domain): %s\n  - 安装目录 (Directory): %s\n  - 服务名称 (Service): github-proxy.service"
TXT_CN_INSTALL_SUCCESS_LOGS="您可以通过 'journalctl -u github-proxy -f' 查看实时日志。（代码来源他人博客：2x.nz）"
TXT_CN_INSTALL_FAILED="安装失败。请检查日志。"
TXT_CN_INSTALL_FAILED_DETAILS="服务未能在端口 %s 上启动。请使用 'systemctl status github-proxy' 和 'journalctl -u github-proxy' 查看错误详情。"
TXT_CN_UNINSTALL_PROMPT="您确定要卸载 GitHub 加速代理吗？这将删除所有相关文件和服务。[y/N]: "
TXT_CN_UNINSTALLING="正在卸载..."
TXT_CN_UNINSTALL_STOP_SERVICE="正在停止并禁用服务..."
TXT_CN_UNINSTALL_RM_FILES="正在删除服务文件和安装目录..."
TXT_CN_UNINSTALL_SUCCESS="卸载完成。"
TXT_CN_UNINSTALL_CANCEL="卸载已取消。"
TXT_CN_INVALID_OPTION="无效选项。"

# 英文文本 (English Texts)
TXT_EN_CHOOSE_LANG="Please select language [1.中文 2.English]: "
TXT_EN_REQUIRE_ROOT="Error: This script must be run as root."
TXT_EN_INSTALL_DIR_PROMPT="Enter installation directory (default: /opt/github-proxy): "
TXT_EN_PROXY_PORT_PROMPT="Enter proxy port (default: 11258): "
TXT_EN_PROXY_DOMAIN_PROMPT="Enter your accelerator domain (e.g., gh.yourdomain.com): "
TXT_EN_DOMAIN_EMPTY="Error: Accelerator domain cannot be empty."
TXT_EN_PORT_IN_USE="Error: Port %s is already in use. Please choose another port."
TXT_EN_CHECKING_DEPS="Checking for base dependencies (wget, tar)..."
TXT_EN_DEPS_OK="Base dependencies are satisfied."
TXT_EN_CHECKING_GO="Checking for Go environment..."
TXT_EN_GO_FOUND="Go environment found: %s"
TXT_EN_GO_NOT_FOUND="Go environment not found. Installing Go ${GO_VERSION} automatically..."
TXT_EN_DOWNLOADING_GO="Downloading Go from %s..."
TXT_EN_INSTALLING_GO="Installing Go to ${GO_INSTALL_DIR}..."
TXT_EN_CONFIGURING_GO_PATH="Configuring Go environment variables..."
TXT_EN_GO_INSTALL_SUCCESS="Go has been installed and configured successfully."
TXT_EN_CREATING_DIR="Creating installation directory: %s"
TXT_EN_WRITING_FILES="Writing main.go and go.mod..."
TXT_EN_COMPILING="Compiling the application..."
TXT_EN_COMPILE_SUCCESS="Application compiled successfully."
TXT_EN_CREATING_SERVICE="Creating systemd service: github-proxy.service"
TXT_EN_STARTING_SERVICE="Starting and enabling service..."
TXT_EN_VERIFYING_SERVICE="Verifying service status..."
TXT_EN_INSTALL_SUCCESS="Congratulations! GitHub accelerator proxy deployed successfully!"
TXT_EN_INSTALL_SUCCESS_DETAILS="  - Listening Port: %s\n  - Accelerator Domain: %s\n  - Install Directory: %s\n  - Service Name: github-proxy.service"
TXT_EN_INSTALL_SUCCESS_LOGS="You can view real-time logs with 'journalctl -u github-proxy -f'."
TXT_EN_INSTALL_FAILED="Installation failed. Please check the logs."
TXT_EN_INSTALL_FAILED_DETAILS="The service failed to start on port %s. Please use 'systemctl status github-proxy' and 'journalctl -u github-proxy' to check for errors."
TXT_EN_UNINSTALL_PROMPT="Are you sure you want to uninstall the GitHub accelerator proxy? This will remove all related files and services. [y/N]: "
TXT_EN_UNINSTALLING="Uninstalling..."
TXT_EN_UNINSTALL_STOP_SERVICE="Stopping and disabling service..."
TXT_EN_UNINSTALL_RM_FILES="Removing service file and installation directory..."
TXT_EN_UNINSTALL_SUCCESS="Uninstallation complete."
TXT_EN_UNINSTALL_CANCEL="Uninstallation cancelled."
TXT_EN_INVALID_OPTION="Invalid option."

# --- 辅助函数 ---
choose_language() { read -p "$(echo -e ${C_YELLOW}${TXT_CN_CHOOSE_LANG}${C_RESET})" lang_choice_num; if [[ "$lang_choice_num" == "1" ]]; then LANG_CHOICE="CN"; elif [[ "$lang_choice_num" == "2" ]]; then LANG_CHOICE="EN"; else echo -e "${C_RED}Invalid choice, defaulting to English.${C_RESET}"; LANG_CHOICE="EN"; fi; if [ "$LANG_CHOICE" == "CN" ]; then for i in $(grep "^TXT_CN_" $0 | cut -d'=' -f1); do var_name=$(echo $i | sed 's/TXT_CN_//g'); eval "TXT_${var_name}=\"\${TXT_CN_${var_name}}\""; done; else for i in $(grep "^TXT_EN_" $0 | cut -d'=' -f1); do var_name=$(echo $i | sed 's/TXT_EN_//g'); eval "TXT_${var_name}=\"\${TXT_EN_${var_name}}\""; done; fi;}
msg() { echo -e "${C_BLUE}INFO:${C_RESET} $1"; }
success() { echo -e "${C_GREEN}SUCCESS:${C_RESET} $1"; }
warn() { echo -e "${C_YELLOW}WARN:${C_RESET} $1"; }
error() { echo -e "${C_RED}ERROR:${C_RESET} $1"; exit 1; }
check_port() { if ss -tlpn | grep -q ":$1" || netstat -tlpn | grep -q ":$1"; then return 0; else return 1; fi; }
install_go() { msg "${TXT_GO_NOT_FOUND//\$\{GO_VERSION\}/${GO_VERSION}}"; msg "$(printf "${TXT_DOWNLOADING_GO}" "${GO_URL}")"; wget -q --show-progress -O /tmp/go.tar.gz "${GO_URL}"; msg "${TXT_INSTALLING_GO//\$\{GO_INSTALL_DIR\}/${GO_INSTALL_DIR}}"; rm -rf "${GO_INSTALL_DIR}/go"; tar -C "${GO_INSTALL_DIR}" -xzf /tmp/go.tar.gz; rm /tmp/go.tar.gz; msg "${TXT_CONFIGURING_GO_PATH}"; echo "export PATH=\$PATH:${GO_INSTALL_DIR}/go/bin" > /etc/profile.d/golang.sh; source /etc/profile.d/golang.sh; success "${TXT_GO_INSTALL_SUCCESS}"; }

# 主要安装流程
do_install() {
    read -p "$(echo -e ${C_YELLOW}${TXT_INSTALL_DIR_PROMPT}${C_RESET})" INSTALL_DIR
    INSTALL_DIR=${INSTALL_DIR:-/opt/github-proxy}
    read -p "$(echo -e ${C_YELLOW}${TXT_PROXY_PORT_PROMPT}${C_RESET})" PROXY_PORT
    PROXY_PORT=${PROXY_PORT:-11258}
    read -p "$(echo -e ${C_YELLOW}${TXT_PROXY_DOMAIN_PROMPT}${C_RESET})" PROXY_DOMAIN
    if [ -z "$PROXY_DOMAIN" ]; then error "${TXT_DOMAIN_EMPTY}"; fi

    # [FIX] 修复逻辑: 端口占用检查失败后立即退出
    if check_port "$PROXY_PORT"; then
        error "$(printf "${TXT_PORT_IN_USE}" "${PROXY_PORT}")"
    fi
    msg "${TXT_CHECKING_DEPS}"; for cmd in wget tar; do if ! command -v $cmd &> /dev/null; then error "Command not found: $cmd"; fi; done; success "${TXT_DEPS_OK}";
    msg "${TXT_CHECKING_GO}"; if ! command -v go &> /dev/null; then install_go; else success "$(printf "${TXT_GO_FOUND}" "$(go version)")"; fi

    msg "$(printf "${TXT_CREATING_DIR}" "${INSTALL_DIR}")"; mkdir -p "${INSTALL_DIR}"
    msg "${TXT_WRITING_FILES}"
    
    # [FIX] 使用 cat << 'EOF' 防止 bash 预处理 Go 代码
    # 并使用独特的占位符 __PROXY_DOMAIN__ 和 __PROXY_PORT__
    cat << 'EOF' > "${INSTALL_DIR}/main.go"
package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
)

var domainMappings = map[string]string{
	"github.com":                    "gh.",
	"avatars.githubusercontent.com": "avatars-githubusercontent-com.",
	"github.githubassets.com":       "github-githubassets-com.",
	"collector.github.com":          "collector-github-com.",
	"api.github.com":                "api-github-com.",
	"raw.githubusercontent.com":     "raw-githubusercontent-com.",
	"gist.githubusercontent.com":    "gist-githubusercontent-com.",
	"github.io":                     "github-io.",
	"assets-cdn.github.com":         "assets-cdn-github-com.",
	"cdn.jsdelivr.net":              "cdn-jsdelivr-net.",
	"securitylab.github.com":        "securitylab-github-com.",
	"www.githubstatus.com":          "www-githubstatus-com.",
	"npmjs.com":                     "npmjs-com.",
	"git-lfs.github.com":            "git-lfs-github-com.",
	"githubusercontent.com":         "githubusercontent-com.",
	"github.global.ssl.fastly.net":  "github-global-ssl-fastly-net.",
	"api.npms.io":                   "api-npms-io.",
	"github.community":              "github-community.",
}

var redirectPaths = []string{"/", "/login", "/signup", "/copilot"}

func shouldRedirect(path string) bool {
	for _, p := range redirectPaths {
		if path == p {
			return true
		}
	}
	return false
}
func getProxyPrefix(host string) string {
	if strings.HasPrefix(host, "gh.") { return "gh." }
	for _, prefix := range domainMappings { if strings.HasPrefix(host, prefix) { return prefix } }
	return ""
}
func getTargetHost(prefix string) string {
	for original, p := range domainMappings { if p == prefix { return original } }
	return ""
}

func modifyResponse(body []byte, contentType, hostPrefix, currentHostname string) []byte {
	if !strings.Contains(contentType, "text/") &&
		!strings.Contains(contentType, "application/json") &&
		!strings.Contains(contentType, "application/javascript") &&
		!strings.Contains(contentType, "application/xml") {
		return body
	}
	text := string(body)
	domainSuffix := currentHostname[len(hostPrefix):]
	for originalDomain, proxyPrefix := range domainMappings {
		fullProxyDomain := proxyPrefix + domainSuffix
		text = strings.ReplaceAll(text, "https://"+originalDomain, "https://"+fullProxyDomain)
		text = strings.ReplaceAll(text, "http://"+originalDomain, "https://"+fullProxyDomain)
		text = strings.ReplaceAll(text, "//"+originalDomain, "//"+fullProxyDomain)
		text = strings.ReplaceAll(text, `"`+originalDomain+`"`, `"`+fullProxyDomain+`"`)
		text = strings.ReplaceAll(text, `'`+originalDomain+`'`, `'`+fullProxyDomain+`'`)
	}
	if hostPrefix == "gh." {
		text = strings.ReplaceAll(text, `"/`, `"https://`+currentHostname+`/`)
		text = strings.ReplaceAll(text, `'/'`, `'https://`+currentHostname+`/`)
	}
	return []byte(text)
}

func handleRequest(w http.ResponseWriter, r *http.Request) {
	currentHost := r.Host
	if shouldRedirect(r.URL.Path) {
		http.Redirect(w, r, "https://__PROXY_DOMAIN__", http.StatusFound)
		return
	}
	hostPrefix := getProxyPrefix(currentHost)
	if hostPrefix == "" { http.Error(w, "Domain not configured for proxy", http.StatusNotFound); return }
	targetHost := getTargetHost(hostPrefix)
	if targetHost == "" { http.Error(w, "Domain not configured for proxy", http.StatusNotFound); return }
	pathname := r.URL.Path
	re1 := regexp.MustCompile(`(/[^/]+/[^/]+/(?:latest-commit|tree-commit-info)/[^/]+)/https%3A//[^/]+.*`)
	pathname = re1.ReplaceAllString(pathname, "$1")
	re2 := regexp.MustCompile(`(/[^/]+/[^/]+/(?:latest-commit|tree-commit-info)/[^/]+)/https://[^/]+.*`)
	pathname = re2.ReplaceAllString(pathname, "$1")
	re3 := regexp.MustCompile(`(/[^/]+/[^/]+/(?:latest-commit|tree-commit-info)/[^/]+)/https:/[^/]+.*`)
	pathname = re3.ReplaceAllString(pathname, "$1")

	targetURL := &url.URL{ Scheme: "https", Host: targetHost, Path: pathname, RawQuery: r.URL.RawQuery }
	req, err := http.NewRequest(r.Method, targetURL.String(), r.Body)
	if err != nil { http.Error(w, fmt.Sprintf("Failed to create request: %v", err), http.StatusInternalServerError); return }
	for key, values := range r.Header { for _, value := range values { req.Header.Add(key, value) } }
	req.Header.Set("Host", targetHost)
	req.Header.Set("Referer", targetURL.String())
	req.Header.Set("Accept-Encoding", "identity")
	client := &http.Client{ Timeout: 30 * time.Second }
	resp, err := client.Do(req)
	if err != nil { http.Error(w, fmt.Sprintf("Proxy Error: %v", err), http.StatusBadGateway); return }
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil { http.Error(w, fmt.Sprintf("Failed to read response: %v", err), http.StatusInternalServerError); return }
	modifiedBody := modifyResponse(body, resp.Header.Get("Content-Type"), hostPrefix, currentHost)
	for key, values := range resp.Header {
		if key == "Content-Encoding" || key == "Content-Length" { continue }
		for _, value := range values { w.Header().Add(key, value) }
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Cache-Control", "public, max-age=14400")
	w.Header().Del("Content-Security-Policy")
	w.Header().Del("Content-Security-Policy-Report-Only")
	w.Header().Del("Clear-Site-Data")
	w.Header().Set("Content-Length", fmt.Sprintf("%d", len(modifiedBody)))
	w.WriteHeader(resp.StatusCode)
	w.Write(modifiedBody)
}

func main() {
	http.HandleFunc("/", handleRequest)
	port := fmt.Sprintf(":%s", "__PROXY_PORT__")
	log.Printf("GitHub proxy server starting on port %s", port)
	log.Printf("Please ensure your domain is correctly configured and pointing to this server.")
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal("Server startup failed:", err)
	}
}
EOF

    # [FIX] 使用 sed 安全地替换占位符
    sed -i "s/__PROXY_DOMAIN__/${PROXY_DOMAIN}/g" "${INSTALL_DIR}/main.go"
    sed -i "s/__PROXY_PORT__/${PROXY_PORT}/g" "${INSTALL_DIR}/main.go"
    
    cat << 'EOF' > "${INSTALL_DIR}/go.mod"
module github-proxy

go 1.19
EOF

    msg "${TXT_COMPILING}"
    (cd "${INSTALL_DIR}" && ${GO_BIN_PATH} build -o github-proxy-bin .)
    success "${TXT_COMPILE_SUCCESS}"

    msg "${TXT_CREATING_SERVICE}"
    # 使用和上面同样的技术来创建 service 文件，避免变量替换问题
    cat << EOF > /etc/systemd/system/github-proxy.service
[Unit]
Description=GitHub Proxy Go Accelerator Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
ExecStart=${INSTALL_DIR}/github-proxy-bin
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

    msg "${TXT_STARTING_SERVICE}"; systemctl daemon-reload; systemctl enable github-proxy.service; systemctl restart github-proxy.service

    msg "${TXT_VERIFYING_SERVICE}"; sleep 2
    if check_port "$PROXY_PORT"; then
        success "${TXT_INSTALL_SUCCESS}"
        echo -e "${C_GREEN}$(printf "${TXT_INSTALL_SUCCESS_DETAILS}" "${PROXY_PORT}" "${PROXY_DOMAIN}" "${INSTALL_DIR}")${C_RESET}"
        warn "${TXT_INSTALL_SUCCESS_LOGS}"
    else
        error "$(printf "${TXT_INSTALL_FAILED_DETAILS}" "${PROXY_PORT}")"
    fi
}

do_uninstall() {
    read -p "$(echo -e ${C_YELLOW}${TXT_UNINSTALL_PROMPT}${C_RESET})" confirm
    if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then msg "${TXT_UNINSTALL_CANCEL}"; exit 0; fi
    msg "${TXT_UNINSTALLING}"; INSTALL_DIR_UNINSTALL=/opt/github-proxy
    if [ -f /etc/systemd/system/github-proxy.service ]; then INSTALL_DIR_UNINSTALL=$(grep "WorkingDirectory=" /etc/systemd/system/github-proxy.service | cut -d'=' -f2); fi
    msg "${TXT_UNINSTALL_STOP_SERVICE}"; systemctl stop github-proxy.service || true; systemctl disable github-proxy.service || true
    msg "${TXT_UNINSTALL_RM_FILES}"; rm -f /etc/systemd/system/github-proxy.service; systemctl daemon-reload; rm -rf "${INSTALL_DIR_UNINSTALL}"
    warn "Go environment in ${GO_INSTALL_DIR}/go is not removed as it might be used by other applications."
    warn "If you want to remove it, run: rm -rf ${GO_INSTALL_DIR}/go and rm -f /etc/profile.d/golang.sh"
    success "${TXT_UNINSTALL_SUCCESS}"
}

main() {
    if [ "$(id -u)" -ne 0 ]; then choose_language; error "${TXT_REQUIRE_ROOT}"; fi
    if [ "$1" == "uninstall" ]; then choose_language; do_uninstall; else choose_language; do_install; fi
}

main "$@"
