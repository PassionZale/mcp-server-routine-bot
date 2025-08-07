#!/usr/bin/env node

import MCPServer from "./server.js";

async function main() {
  const server = MCPServer.getInstance();
  await server.start();
}

// 只有直接运行这个文件时才启动服务器
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

// 方便其他模块仍可以导入使用
export { MCPServer };
