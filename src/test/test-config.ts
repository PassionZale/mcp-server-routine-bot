#!/usr/bin/env node

import appConfig from "../config/index.js";

async function testAppConfig() {
  console.log("Testing AppConfig...");
  
  // 等待一段时间以确保异步请求完成
  console.log("Waiting for async request to complete...");
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 打印 tapd_userinfo 的值
  console.log("tapd_userinfo:", appConfig.config.tapd_userinfo);
  
  // 尝试直接调用 getTapdUserInfo 方法
  // 注意：由于 getTapdUserInfo 是私有方法，我们无法直接调用它
  // 但我们可以检查 tapd_userinfo 是否已正确赋值
  
  if (appConfig.config.tapd_userinfo) {
    console.log("Successfully retrieved TAPD user info:");
    console.log(JSON.stringify(appConfig.config.tapd_userinfo, null, 2));
  } else {
    console.log("Failed to retrieve TAPD user info. It may be undefined due to:");
    console.log("1. Invalid or missing TAPD_ACCESS_TOKEN");
    console.log("2. Network issues");
    console.log("3. TAPD API changes");
  }
}

testAppConfig().catch(console.error);
