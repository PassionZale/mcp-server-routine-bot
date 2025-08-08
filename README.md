# MCP Server Routine Bot

![Version](https://img.shields.io/npm/v/@code-sugar/mcp-server-routine-bot)
![License](https://img.shields.io/npm/l/@code-sugar/mcp-server-routine-bot)
![Downloads](https://img.shields.io/npm/dt/@code-sugar/mcp-server-routine-bot)

A Model Context Protocol (MCP) server designed to automate routine operations and enhance productivity through intelligent task automation.

## Overview

MCP-Server-Routine-Bot is an intelligent automation assistant that streamlines repetitive workflows and eliminates time-consuming manual tasks. Built on the Model Context Protocol (MCP) framework, it seamlessly integrates with popular development tools to provide automated solutions for common operational challenges.

### Key Features

- **Task Automation**: Automatically handle repetitive daily operations
- **Tool Integration**: Native support for Jenkins and TAPD platforms
- **Smart Workflows**: Customizable automation pipelines for various scenarios
- **Real-time Monitoring**: Track and manage automated processes
- **Hot Reload**: Development-friendly architecture with HRM support

## Quick Start

### Configuration

Configure the server with your platform credentials:

```json
{
  "mcpServers": {
    "mcp-server-routine-bot": {
      "command": "npx",
      "args": ["-y", "@code-sugar/mcp-server-routine-bot"],
      "env": {
        "TAPD_NICK": "your_tapd_nickname",
        "TAPD_BASE_URL": "https://api.tapd.cn",
        "TAPD_ACCESS_TOKEN": "your_tapd_access_token",
        "JENKINS_BASE_URL": "your_jenkins_base_url",
        "JENKINS_ACCESS_TOKEN": "your_jenkins_access_token"
      }
    }
  }
}
```

### Environment Variables

| Variable               | Required | Default               | Description                |
| ---------------------- | -------- | --------------------- | -------------------------- |
| `TAPD_NICK`            | ✅       | -                     | Your TAPD account nickname |
| `TAPD_BASE_URL`        | ❌       | `https://api.tapd.cn` | TAPD API base URL          |
| `TAPD_ACCESS_TOKEN`    | ✅       | -                     | TAPD API access token      |
| `JENKINS_BASE_URL`     | ✅       | -                     | Jenkins server base URL    |
| `JENKINS_ACCESS_TOKEN` | ✅       | -                     | Jenkins API access token   |

## Development Guide

### Prerequisites

- Node.js >= 18
- npm or yarn

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/PassionZale/mcp-server-routine-bot.git
   cd mcp-server-routine-bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create environment configuration:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

### Development Modes

#### Option 1: MCP Inspector (No HRM)

For debugging and inspection:

1. Start development server:

   ```bash
   npm run inspector
   ```

2. Configure your MCP client:
   ```json
   {
     "mcpServers": {
       "local-mcp-server-routine-bot": {
         "command": "node",
         "args": ["/path/to/your/mcp-server-routine-bot/dist/index.js"]
       }
     }
   }
   ```

**Note**:

- The inspector command automatically reads environment variables from the `.env` file
- Changes to `src/index.ts` and `src/server.ts` require manual server restart
- Changes to other files require re-running the inspector command

#### Option 2: Reloaderoo (With HRM)

For development with Hot Reload support:

1. Install reloaderoo globally:

   ```bash
   npm install -g reloaderoo
   ```

2. Start development server:

   ```bash
   npm run build:watch
   ```

3. Configure your MCP client:
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
           "TAPD_NICK": "your_nickname",
           "TAPD_BASE_URL": "https://api.tapd.cn",
           "TAPD_ACCESS_TOKEN": "your_access_token",
           "JENKINS_BASE_URL": "your_jenkins_url",
           "JENKINS_ACCESS_TOKEN": "your_jenkins_token"
         }
       }
     }
   }
   ```

### Building for Production

```bash
npm run build
```

The compiled output will be available in the `dist/` directory.

## Troubleshooting

### Common Issues

1. **Server not responding**: Ensure all required environment variables are set
2. **Authentication errors**: Verify your access tokens are valid and have proper permissions
3. **Connection timeouts**: Check network connectivity to your configured services

### Debugging

Enable debug logging by setting the log level:

```bash
# When using reloaderoo
reloaderoo proxy log-level debug -- node dist/index.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Lei Zhang - [@PassionZale](https://github.com/PassionZale)

Project Link: [https://github.com/PassionZale/mcp-server-routine-bot](https://github.com/PassionZale/mcp-server-routine-bot)
