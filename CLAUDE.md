# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Guidelines

- **Language Priority**: 优先使用中文回复，除非用户明确要求使用英文
- **Compatibility Considerations**: 不需要考虑兼容性问题，除非用户有明确要求

## Project Overview

This is a Model Context Protocol (MCP) server called "mcp-server-routine-bot" that provides automated routine operations for Jenkins and GitLab platforms. It's designed to simplify daily repetitive tasks like code merging and version releases through intelligent task automation.

## Key Commands

### Development Commands
```bash
# Build the project
npm run build

# Build with watch mode (for development)
npm run build:watch

# Run MCP inspector for debugging
npm run inspector

# Prepare for publishing
npm run prepare

# Publish to npm
npm run release
```

### Testing and Debugging
- Use `npm run inspector` to debug with MCP Inspector - reads from `.env` file automatically
- For hot-reload development, use `npm run build:watch` with reloaderoo
- Manual server restart required when modifying `src/index.ts` or `src/server.ts` in inspector mode

## Architecture

### Core Structure
- **Singleton MCP Server**: Uses `MCPServer` class with singleton pattern for managing the MCP server instance
- **Configuration Management**: `AppConfig` class handles environment variable loading for Jenkins and GitLab credentials
- **Tool System**: Modular tool definitions for Jenkins and GitLab operations
- **HTTP Client Layer**: Unified request handlers with authentication and error handling

### Key Components

#### Server (`src/server.ts`)
- Main MCP server implementation using singleton pattern
- Handles tool listing, execution, and logging
- Implements configurable log levels with priority filtering
- Routes tool calls to appropriate handlers

#### Configuration (`src/config/index.ts`)
- Environment-based configuration for Jenkins and GitLab
- Required env vars: `JENKINS_BASE_URL`, `JENKINS_USERNAME`, `JENKINS_ACCESS_TOKEN`, `GITLAB_BASE_URL`, `GITLAB_ACCESS_TOKEN`

#### Tools Structure
- **Jenkins Tools** (`src/tools/jenkins/`): Job listing and build triggering
- **GitLab Tools** (`src/tools/gitlab/`): Merge request creation and merging
- Each tool has dedicated type definitions and input schemas

#### Common Utilities (`src/common/`)
- `utils.ts`: HTTP request functions for Jenkins and GitLab APIs
- `errors.ts`: Structured error handling with HTTP status codes
- `gitlab/merge.ts`: GitLab-specific merge operations with status polling

### Request Flow
1. Tool call received → `MCPServer.executeTool()`
2. Route to specific handler method
3. Handler uses `makeJenkinsRequest()` or `makeGitlabRequest()`
4. HTTP request with proper authentication
5. Response formatted and returned via MCP protocol

## Development Notes

### TypeScript Configuration
- Uses Node.js 22 target with ES modules
- Path aliases configured (`@/*` → `./src/*`)
- Output directory: `dist/`

### Authentication
- Jenkins: Basic Auth using username and access token
- GitLab: Bearer token using `PRIVATE-TOKEN` header

### Error Handling
- Custom error creation with `createRoutineBotError()`
- HTTP status code propagation
- Structured error responses for MCP clients

## Environment Setup

Create `.env` file with:
```
JENKINS_BASE_URL=your_jenkins_url
JENKINS_USERNAME=your_username
JENKINS_ACCESS_TOKEN=your_token
GITLAB_BASE_URL=your_gitlab_url
GITLAB_ACCESS_TOKEN=your_token
```