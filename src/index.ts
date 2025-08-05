#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import pkg from "@@/package.json" with { type: "json" };

// Create server instance
const server = new McpServer({
  name: "mcp-server/routine-bot",
  version: pkg.version,
  capabilities: {
    resources: {},
    tools: {},
  },
});
