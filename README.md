# GitHub Accelerator - 浏览器扩展 & 自建后端

[![版本](https://img.shields.io/badge/version-1.1.2-blue.svg)](https://github.com/ANgeFade/GitHub-Accelerator)
[![许可证](https://img.shields.io/badge/license-GPL--3.0-brightgreen.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![开发者](https://img.shields.io/badge/Author-ANgeFade-orange.svg)](https://github.com/ANgeFade)
[![AI赋能](https://img.shields.io/badge/AI--Powered-by%20Gemini-blueviolet.svg)](https://deepmind.google/technologies/gemini/)

一套强大、灵活的GitHub完整加速解决方案，包含**浏览器扩展**和**一键化反向代理后端**。本项目由作者精心设计，并与先进的AI模型协作开发，旨在彻底解决GitHub访问速度慢、资源加载失败等问题。

---

## 目录

- [**重要：免责声明**](#重要免责声明--important-disclaimer)
- [项目简介](#项目简介)
  - [核心架构：同级子域名代理](#核心架构同级子域名代理)
- [功能特性](#功能特性)
- [第一部分：浏览器扩展使用指南](#第一部分浏览器扩展使用指南)
- [第二部分：自建加速后端指南](#第二部分自建加速后端指南)
- [常见问题 (FAQ)](#常见问题-faq)
- [鸣谢与致敬](#鸣谢与致敬)
- [贡献](#贡献)
- [许可证](#许可证)

---

## **重要：免责声明 / IMPORTANT: DISCLAIMER**

> **在使用本项目（包括浏览器扩展和后端脚本）前，您必须仔细阅读并完全同意以下所有条款。**
>
> **Before using this project (including its browser extension and backend scripts), you must read carefully and fully agree to all the following terms.**
>
> 1.  **目的与意图 (Purpose and Intent):** 本项目仅为技术研究与学习之目的，旨在为开发者和技术人员提供一个优化其访问GitHub网络效率的解决方案。严禁将本项目用于任何违反您所在地法律法规的用途。
>
> 2.  **用户责任 (User's Responsibility):** 您对使用本软件所产生的一切行为和后果负全部责任。您必须确保您的使用行为符合您所在国家或地区的所有法律法规，包括但不限于网络管理规定、数据安全法规以及知识产权法。开发者对您因使用本软件而可能产生的任何法律风险或纠纷不承担任何责任。
>
> 3.  **无担保 (No Warranties):** 本项目按“原样”提供，不提供任何形式的明示或暗示的保证，包括但不限于对稳定性、安全性、准确性、不间断服务或适用于特定用途的保证。
>
> 4.  **责任限制 (Limitation of Liability):** 在任何情况下，开发者均不对因使用或无法使用本软件而导致的任何直接、间接、偶然、特殊、惩戒性或后果性损害承担任何责任（包括但不限于数据丢失、利润损失、业务中断或任何形式的法律追责），即使已被告知可能发生此类损害。
>
> 5.  **第三方服务与自建风险 (Third-Party Services & Self-Hosting Risks):**
>     -   当您配置使用公共镜像站点时，您应自行评估其安全性与合法性。开发者不对任何第三方镜像站点的行为负责。
>     -   当您使用脚本搭建自己的后端服务时，您对您服务器的安全、维护、合规性及所有流经该服务器的数据和流量负全部责任。
>
> 6.  **接受条款 (Acceptance of Terms):** 如果您不同意本免责声明中的任何条款，请立即停止使用并卸载本项目的所有组件。您的下载、安装或使用行为，均将被视为您已充分理解并自愿接受本声明的全部内容。

---

## 项目简介

**GitHub Accelerator** 是一套完整的GitHub访问加速方案。它由两部分组成：

1.  **浏览器扩展 (前端)**：一个基于 Chrome Manifest V3 开发的高效扩展。它通过 `declarativeNetRequest` API，在网络请求层面以极低的性能开销，将所有对GitHub及其相关域名的访问无缝重定向到您配置的镜像地址。
2.  **反向代理后端 (可选)**：一个配套的Go语言反向代理服务。我们提供了一个自动化部署脚本 (`install_proxy.sh`)，让您可以轻松在自己的服务器上搭建一个私有的、高性能的GitHub镜像服务。

您可以只使用**浏览器扩展**并配置一个公开的镜像地址，也可以通过**部署自己的后端**来获得最稳定、最可控的加速体验。

### 核心架构：同级子域名代理

本方案采用创新的“同级子域名”代理模式。当您配置好自己的根域名（如 `mydomain.com`）后，系统会将GitHub的不同官方域名智能地映射为您域名下对应的、平级的子域名。

**映射规则示例：**
- `github.com`  -> `gh.mydomain.com`
- `avatars.githubusercontent.com` -> `avatars-githubusercontent-com.mydomain.com`
- `raw.githubusercontent.com` -> `raw-githubusercontent-com.mydomain.com`
- ...依此类推

这种架构逻辑清晰，避免了多层子域名带来的潜在问题，确保了所有资源都能被准确地代理和加速。

## 功能特性

-   **高效重定向**：基于Manifest V3的`declarativeNetRequest`，在浏览器核心网络层处理请求，比传统方式更快、更安全。
-   **全面的域名覆盖**：通过同级子域名映射，不仅加速 `github.com`，还完整覆盖所有关键域名，确保页面样式、头像、文件下载、API调用等获得一致的加速体验。
-   **一键化后端部署**：提供自动化Shell脚本，可在任何Linux服务器上一键部署高性能Go语言反向代理后端，无需手动配置环境。
-   **灵活控制**：通过扩展弹出窗口，可以轻松启用/禁用加速功能，并随时更换镜像地址的**根域名**。
-   **智能状态显示**：图标颜色清晰指示插件状态；弹出窗口能智能显示当前页面的原始URL和镜像URL。
-   **隐私安全**：扩展仅在本地存储配置，不收集任何用户数据。自建后端完全由您掌控。

## 第一部分：浏览器扩展使用指南

如果您只想使用公开的镜像站点进行加速，请遵循此部分。

### 安装扩展

目前本扩展尚未发布到 Chrome 网上应用店，您可以通过以下步骤手动加载：

1.  **下载代码**:
    -   通过`git clone https://github.com/ANgeFade/GitHub-Accelerator.git`克隆本仓库。
    -   或者直接下载ZIP包并解压。

2.  **打开Chrome扩展管理页面**:
    -   在地址栏输入 `chrome://extensions` 并回车。

3.  **启用开发者模式**:
    -   在扩展管理页面的右上角，打开“开发者模式”开关。

4.  **加载扩展**:
    -   点击左上角的“加载已解压的扩展程序”按钮。
    -   在弹出的文件选择框中，选择您刚刚下载并解压的 `GitHub-Accelerator` 文件夹。

5.  **完成**:
    -   扩展图标将出现在浏览器工具栏。建议将其固定，方便随时访问。

### 配置与使用

1.  **点击图标**：点击浏览器工具栏上的 **GitHub 加速器** 图标，打开设置弹窗。
2.  **启用加速**：点击“开关”按钮，使其变为“已启用”状态。
3.  **设置镜像地址**：
    -   在“镜像地址”输入框中，填入一个**基础域名**（根域名）。
    -   **重要**：扩展会自动根据访问的站点（如`github.com`或`avatars.githubusercontent.com`）为您拼接正确的前缀。您只需填写根域名部分。
    -   例如，使用公开镜像站，您可以填写：`kgithub.com`
4.  **测试跳转**：点击“测试跳转”按钮，将尝试在新标签页中打开GitHub。如果配置正确，页面将自动跳转到镜像后的地址（例如 `gh.kgithub.com`）。

## 第二部分：自建加速后端指南

如果您拥有自己的服务器和域名，并希望获得最稳定、私有的加速服务，请遵循此部分。

### 适用场景

-   您拥有一台可以访问外网的Linux服务器（VPS）。
-   您拥有一个自己的域名。
-   您追求极致的稳定性和隐私，不希望依赖第三方公共镜像。

### 准备工作

1.  **一台Linux服务器**：确保拥有`root`权限。
2.  **一个域名**：例如 `mydomain.com`。

### 一键部署

1.  登录到您的Linux服务器。
2.  下载并执行安装脚本：
    ```bash
    wget -O install_proxy.sh https://raw.githubusercontent.com/ANgeFade/GitHub-Accelerator/main/install_proxy.sh
    bash install_proxy.sh
    ```
3.  根据脚本提示进行交互式配置：
    -   **选择语言**
    -   **输入安装目录** (默认为 `/opt/github-proxy`)
    -   **输入代理端口** (默认为 `11258`)
    -   **输入您的加速域名**: 这是**最关键的一步**。请填写您准备用于加速的**根域名**。例如，如果您的域名是 `mydomain.com`，您就在此输入 `mydomain.com`。

脚本将自动完成环境检查、Go程序编译、以及`systemd`服务的创建与启动。

### 配置DNS解析（关键步骤）

**这是确保自建服务正常工作的核心环节。** 您需要为所有被代理的域名创建指向您服务器IP的A记录。

登录您的域名提供商（如Cloudflare, GoDaddy, 阿里云等）的DNS管理面板，添加以下**所有A记录**：

| 类型 | 主机记录 (Name)                 | 指向 (Value/Content) |
| :--- | :-------------------------------- | :--------------------- |
| A    | `gh`                              | `你的服务器公网IP地址`   |
| A    | `avatars-githubusercontent-com`   | `你的服务器公网IP地址`   |
| A    | `github-githubassets-com`         | `你的服务器公网IP地址`   |
| A    | `collector-github-com`            | `你的服务器公网IP地址`   |
| A    | `api-github-com`                  | `你的服务器公网IP地址`   |
| A    | `raw-githubusercontent-com`       | `你的服务器公网IP地址`   |
| A    | `gist-githubusercontent-com`      | `你的服务器公网IP地址`   |
| A    | `github-io`                       | `你的服务器公网IP地址`   |
| A    | `assets-cdn-github-com`           | `你的服务器公网IP地址`   |
| A    | `cdn-jsdelivr-net`                 | `你的服务器公网IP地址`   |
| A    | `securitylab-github-com`          | `你的服务器公网IP地址`   |
| A    | `www-githubstatus-com`            | `你的服务器公网IP地址`   |
| A    | `npmjs-com`                       | `你的服务器公网IP地址`   |
| A    | `git-lfs-github-com`              | `你的服务器公网IP地址`   |
| A    | `githubusercontent-com`           | `你的服务器公网IP地址`   |
| A    | `github-global-ssl-fastly-net`    | `你的服务器公网IP地址`   |
| A    | `api-npms-io`                     | `你的服务器公网IP地址`   |
| A    | `github-community`                | `你的服务器公网IP地址`   |

**注意：** 必须添加**全部**记录，否则将导致GitHub页面样式丢失、头像或文件无法加载等问题。

### 在扩展中使用自建后端

回到您的浏览器，打开 GitHub 加速器扩展的设置弹窗：
-   在“镜像地址”输入框中，填入您刚刚配置的**根域名**，例如：`mydomain.com`
-   现在，所有GitHub相关的请求都将通过您自己的服务器进行加速！

### 后端卸载

如需移除服务器上的后端服务，执行以下命令：
```bash
bash install_proxy.sh uninstall
```

## 常见问题 (FAQ)

**Q: 为什么页面能打开，但样式、图片都加载不出来？**
**A:** 这几乎总是由于**DNS配置不完整**导致的。请仔细核对[#配置DNS解析（关键步骤）](#配置dns解析关键步骤)章节，确保您已为您域名的**所有**必需子域名都添加了A记录。

**Q: 我应该在扩展里填写 `gh.mydomain.com` 还是 `mydomain.com`？**
**A:** **始终填写根域名**，即 `mydomain.com`。扩展程序会根据您正在访问的原始网站，自动为您拼接正确的前缀（如`gh.`或`avatars-githubusercontent-com.`）。

## 鸣谢与致敬

首先，感谢所有开源GitHub镜像站点的提供者，他们的工作是本项目灵感的来源。

同时，这里要特别致敬人与AI协同工作的全新开发模式。本项目的核心架构与代码由开发者 **ANgeFade** 设计与主导，并在开发过程中深度借助了 **Google Gemini Pro** 的强大能力进行逻辑精炼、方案验证和高质量代码生成。这不仅极大地提升了开发效率，也展现了当开发者的清晰愿景与顶尖AI的执行能力相结合时，所能迸发出的巨大潜力。本项目正是这种高效协作模式下的一个绝佳实践。

## 贡献

欢迎任何形式的贡献，无论是提交Issue、发起Pull Request还是提出改进建议。请遵循项目的GPLv3许可证。

## 许可证

本项目基于 [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0) 协议开源。
