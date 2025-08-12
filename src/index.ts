#!/usr/bin/env node

import MCPServer from "./server.js";

async function main() {
  const server = MCPServer.getInstance();
  await server.start();
}

main().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
