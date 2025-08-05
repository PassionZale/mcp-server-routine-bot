# MCP Server Routine Bot

A Model Context Protocol (MCP) server for routine bot operations.

## Features

- Example MCP tools implementation
- Example MCP resources implementation
- Configurable server settings
- Comprehensive test suite

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd mcp-server-routine-bot
   ```

2. Install dependencies using uv:
   ```bash
   uv sync
   ```

## Usage

To start the MCP server, run:
```bash
uv run python -m src.mcp-server-routine-bot.server
```

## Development

### Running Tests

To run the test suite:
```bash
uv run pytest
```

### Code Formatting

To format the code using black and isort:
```bash
uv run black .
uv run isort .
```

## Configuration

The server can be configured using environment variables or a `.env` file. See `src/mcp-server-routine-bot/config.py` for available configuration options.

## Project Structure

```
mcp-server-routine-bot/
├── pyproject.toml           # Project metadata and dependencies
├── README.md                # This file
├── src/                     # Source code
│   └── mcp-server-routine-bot/  # Main package
│       ├── __init__.py
│       ├── server.py        # MCP Server main entry point
│       ├── config.py        # Configuration management
│       ├── tools/           # MCP tools
│       │   ├── __init__.py
│       │   ├── tool_a.py
│       │   └── tool_b.py
│       └── resources/       # MCP resources
│           ├── __init__.py
│           ├── resource_x.py
│           └── resource_y.py
└── tests/                   # Test suite
    ├── __init__.py
    ├── test_server.py       # Server tests
    └── test_tools/          # Tool tests
        ├── __init__.py
        └── test_tool_a.py
```

MCP-Server-Routine-Bot 是一款为我个人打造的自动化助手，旨在将我从繁琐的日常重复工作中解放出来，专注于处理我个人的工作流程。

它通过集成一些常用的工具，如 Jenkins 和 Tapd，自动完成那些占用时间的重复任务。无论是在下班前自动构建 Jenkins Job，还是每月初自动统计我在 Tapd 上的工时，甚至是快速创建新任务，它都能轻松搞定。
