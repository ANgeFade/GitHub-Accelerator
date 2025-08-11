# GitHub Accelerator - 浏览器扩展 & 自建后端

[![版本](https://img.shields.io/badge/version-1.1.2-blue.svg)](https://github.com/ANgeFade/GitHub-Accelerator)
[![许可证](https://img.shields.io/badge/license-GPL--3.0-brightgreen.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![开发者](https://img.shields.io/badge/Author-ANgeFade-orange.svg)](https://github.com/ANgeFade)
[![Website](https://img.shields.io/badge/Website-lusiya.dpdns.org-brightgreen.svg)](https://lusiya.dpdns.org)
[![AI赋能](https://img.shields.io/badge/AI--Powered-by%20Gemini-blueviolet.svg)](https://deepmind.google/technologies/gemini/)

一套强大、灵活的GitHub完整加速解决方案，包含**浏览器扩展**和**一键化反向代理后端**。本项目由作者精心设计，并与先进的AI模型协作开发，旨在彻底解决GitHub访问速度慢、资源加载失败等问题。

---

## **重要：免责声明与使用条款 / IMPORTANT: DISCLAIMER & TERMS OF USE**

> **在下载、安装或使用本项目的任何部分（包括但不限于浏览器扩展、源代码和后端脚本）之前，您必须仔细阅读、完全理解并无条件同意以下所有条款。如果您不同意，请立即停止使用并删除本项目的所有相关文件。**
>
> **Before downloading, installing, or using any part of this project (including but not limited to the browser extension, source code, and backend scripts), you must read, fully understand, and unconditionally agree to all the following terms. If you do not agree, cease all use and delete all project-related files immediately.**
>
> 1.  **学术与技术研究目的 (For Academic and Technical Research Purposes Only):** 本项目旨在探讨和学习网络请求重定向与反向代理技术，是一个纯粹的技术性开源项目。**严禁**将本项目用于任何违反您所在国家或地区现行法律法规的用途。开发者不鼓励、不支持、不参与任何可能非法的网络活动。
>
> 2.  **用户的绝对责任 (User's Absolute Responsibility):** 您对使用本软件所引发的一切行为、风险和后果负有**100%的全部责任**。您是该行为的唯一执行者和责任人。您必须自行确保您的使用行为在您所在地的法律框架下是合法的。开发者对您因使用或滥用本软件而导致的任何民事纠纷、行政处罚、刑事追责或任何形式的损失，概不负责。
>
> 3.  **“原样”提供，无任何保证 (Provided "AS IS" Without Any Warranty):** 本项目按“原样”提供，不包含任何形式的明示或暗示的保证。这包括但不限于对项目的**稳定性、安全性、准确性、可靠性、可用性、不侵权性或适用于任何特定用途**的保证。您须自行承担使用本软件的所有风险。
>
> 4.  **责任豁免 (Exemption from Liability):** 在任何法律允许的最大范围内，开发者及其贡献者在任何情况下均不对因使用或无法使用本软件而造成的任何直接、间接、偶然、特殊、惩戒性或后果性损害承担责任。这包括但不限于数据丢失、利润损失、业务中断、服务器成本、法律费用或任何其他有形或无形的损失，即使已被告知存在此类损害的可能性。
>
> 5.  **自建服务与第三方风险 (Self-Hosting and Third-Party Risks):**
>     -   当您使用脚本搭建自己的后端服务时，您将成为该服务的“**运营者**”，并对通过该服务的所有网络流量负全部法律责任。您必须负责服务器的安全、维护和合规运营。
>     -   当您配置使用任何**第三方或公共镜像站点**（包括作者提供的演示站点）时，您应独立评估其安全性和合法性。开发者无法控制也无法为任何第三方服务的行为或内容负责。
>
> 6.  **条款的修改权与最终解释权 (Right to Modify and Final Interpretation):** 开发者保留随时修改本免责声明与使用条款的权利，恕不另行通知。本声明的最新版本将发布于本项目的GitHub页面。**您在声明修改后继续使用本项目的行为，即表示您已阅读、理解并接受修改后的全部条款。** 本免责声明的最终解释权归项目开发者所有。

---

## 目录

- [项目简介](#项目简介)
- [功能特性](#功能特性)
- [第一部分：浏览器扩展使用指南](#第一部分浏览器扩展使用指南)
- [第二部分：自建加速后端指南](#第二部分自建加速后端指南)
- [常见问题 (FAQ)](#常见问题-faq)
- [鸣谢与致敬](#鸣谢与致敬)
- [贡献](#贡献)
- [许可证](#许可证)

---

## 项目简介

**GitHub Accelerator** 是一套完整的GitHub访问加速方案。它由两部分组成：

1.  **浏览器扩展 (前端)**：一个基于 Chrome Manifest V3 开发的高效扩展。
2.  **反向代理后端 (可选)**：一个配套的Go语言反向代理服务，并提供一键化部署脚本。

### 核心架构：同级子域名代理

本方案采用创新的“同级子域名”代理模式。当您配置好自己的根域名（如 `mydomain.com`）后，系统会将GitHub的不同官方域名智能地映射为您域名下对应的、平级的子域名。

**映射规则示例：**
- `github.com`  -> `gh.mydomain.com`
- `avatars.githubusercontent.com` -> `avatars-githubusercontent-com.mydomain.com`
- `raw.githubusercontent.com` -> `raw-githubusercontent-com.mydomain.com`

## 功能特性

-   **高效重定向**：基于Manifest V3的`declarativeNetRequest`，性能开销极低。
-   **全面的域名覆盖**：确保页面样式、头像、文件下载等获得一致的加速体验。
-   **一键化后端部署**：提供自动化Shell脚本，轻松部署私有后端。
-   **灵活控制与智能显示**：轻松启用/禁用，更换镜像地址，并智能显示URL对应关系。
-   **隐私安全**：扩展不收集用户数据，自建后端完全由您掌控。

## 第一部分：浏览器扩展使用指南

### 安装扩展

目前本扩展尚未发布到 Chrome 网上应用店，您可以通过以下步骤手动加载：

1.  **下载代码**: `git clone https://github.com/ANgeFade/GitHub-Accelerator.git` 或下载ZIP包。
2.  **打开Chrome扩展管理页面**: 在地址栏输入 `chrome://extensions`。
3.  **启用开发者模式**: 在页面右上角打开开关。
4.  **加载扩展**: 点击“加载已解压的扩展程序”，选择项目文件夹。

### 配置与使用

1.  **点击图标**，打开设置弹窗。
2.  **启用加速**，点击开关。
3.  **设置镜像地址**：
    -   在“镜像地址”输入框中，填入一个**基础域名**（根域名）。
    -   例如，您可以使用项目的官方演示站： `lusiya.dpdns.org`。
    -   **(注意: 此公共镜像仅作演示和测试用途，不保证其稳定性、安全性或长期可用性，随时可能失效。强烈建议您搭建自己的后端服务以获得最佳体验。)**
4.  **测试跳转**，验证配置。

## 第二部分：自建加速后端指南

### 准备工作

1.  一台拥有`root`权限的Linux服务器。
2.  一个您自己的域名（例如 `mydomain.com`）。

### 一键部署

1.  登录服务器，执行以下命令：
    ```bash
    wget -O install_proxy.sh https://raw.githubusercontent.com/ANgeFade/GitHub-Accelerator/main/install_proxy.sh
    bash install_proxy.sh
    ```
2.  根据提示输入您的**根域名**（例如 `mydomain.com`）。

### 配置DNS解析（关键步骤）

登录您的域名提供商，为以下**所有**主机记录添加A记录，指向您的服务器IP地址。

| 主机记录 (Name)                 |
| :-------------------------------- |
| `gh`                              |
| `avatars-githubusercontent-com`   |
| `github-githubassets-com`         |
| `collector-github-com`            |
| `api-github-com`                  |
| `raw-githubusercontent-com`       |
| `gist-githubusercontent-com`      |
| `github-io`                       |
| `assets-cdn-github-com`           |
| `cdn-jsdelivr-net`                 |
| `securitylab-github-com`          |
| `www-githubstatus-com`            |
| `npmjs-com`                       |
| `git-lfs-github-com`              |
| `githubusercontent-com`           |
| `github-global-ssl-fastly-net`    |
| `api-npms-io`                     |
| `github-community`                |

### 后端卸载

如需移除服务，执行：`bash install_proxy.sh uninstall`

## 常见问题 (FAQ)

**Q: 为什么页面样式、图片加载不出来？**
**A:** **DNS配置不完整**。请仔细核对[#配置DNS解析（关键步骤）](#配置dns解析关键步骤)，确保所有必需的子域名A记录都已正确添加。

**Q: 我应该在扩展里填写 `gh.mydomain.com` 还是 `mydomain.com`？**
**A:** **始终填写根域名**，例如 `mydomain.com` 或 `lusiya.dpdns.org`。

## 鸣谢与致敬

首先，感谢所有开源GitHub镜像站点的提供者，他们的工作是本项目灵感的来源。

同时，这里要特别致敬人与AI协同工作的全新开发模式。本项目的核心架构与代码由开发者 **ANgeFade** 设计与主导，并在开发过程中深度借助了 **Google Gemini Pro** 的强大能力进行逻辑精炼、方案验证和高质量代码生成。这不仅极大地提升了开发效率，也展现了当开发者的清晰愿景与顶尖AI的执行能力相结合时，所能迸发出的巨大潜力。

## 贡献

欢迎任何形式的贡献。所有贡献行为都意味着您已阅读并同意本项目的[免责声明与使用条款](#重要免责声明--important-disclaimer)。

## 许可证

本项目基于 [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0) 协议开源。
