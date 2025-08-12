#!/usr/bin/env node

import MCPServer from "./server.js";

async function main() {
  const server = MCPServer.getInstance();
  await server.start();
}

main().catch(console.error);
