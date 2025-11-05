# MCP Server Routine Bot

![Version](https://img.shields.io/npm/v/@code-sugar/mcp-server-routine-bot)
![License](https://img.shields.io/npm/l/@code-sugar/mcp-server-routine-bot)
![Downloads](https://img.shields.io/npm/dt/@code-sugar/mcp-server-routine-bot)
![Status](https://img.shields.io/badge/status-in--development-orange)

一个基于模型上下文协议（MCP）的服务器，旨在通过智能任务自动化来简化日常操作并提高工作效率。

> ⚠️ **注意**：此项目正在积极开发中。功能可能会发生变化，某些功能可能不完整或不稳定。

## 概述

MCP-Server-Routine-Bot 基于模型上下文协议（MCP）框架构建，是我个人用于学习 MCP 的项目，内置的工具旨在为我处理日常工作中重复的操作，例如代码合并、版本发布等。

### 主要特性

- **任务自动化**：自动处理重复的日常操作
- **工具集成**：原生支持 Jenkins 和 GitLab 平台
- **智能工作流**：为各种场景提供可定制的自动化流程
- **实时监控**：跟踪和管理自动化进程
- **热重载**：支持 HRM 的开发友好架构

## 可用工具

### Jenkins 工具
| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `jenkins_job_list` | 获取 Jenkins 中的所有作业列表 | 无 |
| `jenkins_job_build` | 触发指定 Jenkins 作业的构建 | `jobName` (必需) |

### GitLab 工具
| 工具名称 | 描述 | 参数 |
|---------|------|------|
| `gitlab_create_merge_request` | 在 GitLab 中创建合并请求 | `projectId`, `projectName`, `sourceBranch`, `targetBranch` |
| `gitlab_merge_merge_request` | 在 GitLab 中合并指定的合并请求 | `projectId` (必需), `mergeRequestIid` (必需) |

### 使用示例

#### Jenkins 操作
```bash
# 获取作业列表
jenkins_job_list

# 构建指定作业
jenkins_job_build({"jobName": "my-project"})
```

#### GitLab 操作
```bash
# 创建合并请求
gitlab_create_merge_request({
  "projectName": "my-project",
  "sourceBranch": "feature-branch",
  "targetBranch": "main"
})

# 合并指定的合并请求（使用创建时返回的 IID）
gitlab_merge_merge_request({
  "projectId": 123,
  "mergeRequestIid": 456
})
```

## 快速开始

### 配置

使用您的平台凭证配置服务器：

```json
{
  "mcpServers": {
    "mcp-server-routine-bot": {
      "command": "npx",
      "args": ["-y", "@code-sugar/mcp-server-routine-bot@latest"],
      "env": {
        "JENKINS_BASE_URL": "jenkins_base_url",
        "JENKINS_USERNAME": "jenkins_username",
        "JENKINS_ACCESS_TOKEN": "jenkins_access_token",
        "GITLAB_BASE_URL": "gitlab_base_url",
        "GITLAB_ACCESS_TOKEN": "gitlab_access_token"
      }
    }
  }
}
```

### 环境变量

| 变量名                   | 必需 | 默认值 | 说明                    |
| ----------------------- | ---- | ------ | ----------------------- |
| `JENKINS_BASE_URL`     | ✅   | -      | Jenkins 服务器基础地址  |
| `JENKINS_USERNAME`     | ✅   | -      | Jenkins 用户名          |
| `JENKINS_ACCESS_TOKEN` | ✅   | -      | Jenkins API 访问令牌    |
| `GITLAB_BASE_URL`      | ✅   | -      | GitLab API 基础地址     |
| `GITLAB_ACCESS_TOKEN`  | ✅   | -      | GitLab API 访问令牌     |

## 开发指南

### 环境要求

- Node.js >= 18
- npm 或 yarn

### 安装设置

1. 克隆仓库：

   ```bash
   git clone https://github.com/PassionZale/mcp-server-routine-bot.git
   cd mcp-server-routine-bot
   ```

2. 安装依赖：

   ```bash
   npm install
   ```

3. 创建环境配置：
   ```bash
   cp .env.example .env
   # 编辑 .env 文件填入凭证信息
   ```

### 开发模式

#### 方式 1：MCP Inspector（无热重载）

用于调试和检查：

1. 启动开发服务器：

   ```bash
   npm run inspector
   ```

2. 配置 MCP 客户端：
   ```json
   {
     "mcpServers": {
       "local-mcp-server-routine-bot": {
         "command": "node",
         "args": ["/path/to/your/mcp-server-routine-bot/dist/index.js"],
         "env": {
           "JENKINS_BASE_URL": "jenkins_base_url",
           "JENKINS_USERNAME": "jenkins_username",
           "JENKINS_ACCESS_TOKEN": "jenkins_access_token",
           "GITLAB_BASE_URL": "gitlab_base_url",
           "GITLAB_ACCESS_TOKEN": "gitlab_access_token"
         }
       }
     }
   }
   ```

**注意**：

- inspector 命令会自动从 `.env` 文件读取环境变量
- 修改 `src/index.ts` 和 `src/server.ts` 需要手动重启服务器
- 修改其他文件需要重新运行 inspector 命令

#### 方式 2：Reloaderoo（支持热重载）

用于支持热重载的开发：

1. 全局安装 reloaderoo：

   ```bash
   npm install -g reloaderoo
   ```

2. 启动开发服务器：

   ```bash
   npm run build:watch
   ```

3. 配置 MCP 客户端：
   ```json
   {
     "mcpServers": {
       "dev-mcp-server-routine-bot": {
         "command": "reloaderoo",
         "args": [
           "proxy",
           "log-level",
           "debug",
           "--",
           "node",
           "/path/to/your/mcp-server-routine-bot/dist/index.js"
         ],
         "env": {
           "JENKINS_BASE_URL": "jenkins_base_url",
           "JENKINS_USERNAME": "jenkins_username",
           "JENKINS_ACCESS_TOKEN": "jenkins_access_token",
           "GITLAB_BASE_URL": "gitlab_base_url",
           "GITLAB_ACCESS_TOKEN": "gitlab_access_token"
         }
       }
     }
   }
   ```

### 生产构建

```bash
npm run build
```

编译后的文件将在 `dist/` 目录中。

## 故障排除

### 常见问题

1. **服务器无响应**：确保所有必需的环境变量都已设置
2. **认证错误**：验证访问令牌是否有效且具有适当权限
3. **连接超时**：检查到配置服务的网络连接

### 调试

通过设置日志级别启用调试日志：

```bash
# 使用 reloaderoo 时
reloaderoo proxy log-level debug -- node dist/index.js
```

## 贡献

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 作者

Lei Zhang - [@PassionZale](https://github.com/PassionZale)

项目链接：[https://github.com/PassionZale/mcp-server-routine-bot](https://github.com/PassionZale/mcp-server-routine-bot)
