#!/usr/bin/env node

import server from "./server.js";

server.start().catch(console.error);
