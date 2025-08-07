#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TAPD_TOOL_DEFINITIONS } from "./tools/tapd/index.js";
import {
  TapdToolNames,
  TapdUserParticipantProjects,
  TapdUsersInfo,
} from "./tools/tapd/types.js";
import { JENKINS_TOOL_DEFINITIONS } from "./tools/jenkins/index.js";
import { JenkinsToolNames } from "./tools/jenkins/types.js";
import { isRoutineBotError } from "./common/errors.js";
import { buildUrl, makeTapdRequest } from "./common/utils.js";
import AppConfig from "@/config/index.js";

class MCPServer {
  private server: Server;
  private appConfig: AppConfig;

  constructor() {
    this.appConfig = new AppConfig();

    this.server = new Server(
      {
        name: "mcp-server-routine-bot",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // 列出所有可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        ...Object.values(TAPD_TOOL_DEFINITIONS),
        ...Object.values(JENKINS_TOOL_DEFINITIONS),
      ],
    }));

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      return this.executeTool(name as TapdToolNames & JenkinsToolNames, args);
    });
  }

  private async executeTool(
    toolName: TapdToolNames & JenkinsToolNames,
    args: any
  ) {
    try {
      switch (toolName) {
        case TapdToolNames.TAPD_USERS_INFO:
          return await this.handleTapdUsersInfo();

        case TapdToolNames.TAPD_USER_PARTICIPANT_PROJECTS:
          return await this.handleTapdUserParticipantProjects(args);

        case JenkinsToolNames.JENKINS_CREATE_MERGE_REQUEST:
          return await this.handleJenkinsCreateMergeRequest();

        default:
          throw new Error(`Tool ${toolName} not implemented`);
      }
    } catch (error) {
      if (isRoutineBotError(error)) {
        return {
          content: [
            {
              type: "text",
              text: `Error executing ${toolName}: ${error.message}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Error executing ${toolName} failed`,
          },
        ],
        isError: true,
      };
    }
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  // 工具处理器实现
  private async handleTapdUsersInfo() {
    const { data } = await makeTapdRequest<TapdUsersInfo>("GET", "users/info");

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
      isError: false,
    };
  }

  private async handleTapdUserParticipantProjects(args: { nick: string }) {
    const { data } = await makeTapdRequest<TapdUserParticipantProjects>(
      "GET",
      buildUrl("workspaces/user_participant_projects", {
        nick: args.nick || this.appConfig.tapd_nick,
      })
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
      isError: false,
    };
  }

  private async handleJenkinsCreateMergeRequest() {
    return {
      content: [
        {
          type: "text",
          text: "Tool jenkins not implemented",
        },
      ],
      isError: true,
    };
  }
}

// 启动服务器
const server = new MCPServer();

server.start().catch(console.error);
