import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  SetLevelRequestSchema,
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
import dayjs from "dayjs";

class MCPServer {
  private static instance: MCPServer | null = null;

  private isInitialized: boolean = false;

  private currentLogLevel: string = "info";

  private logLevelPriority: Record<string, number> = {
    debug: 0,
    info: 1,
    notice: 2,
    warning: 3,
    error: 4,
    critical: 5,
    alert: 6,
    emergency: 7,
  };

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
          logging: {},
          tools: {},
        },
      }
    );
  }

  static getInstance(): MCPServer {
    if (!MCPServer.instance) {
      MCPServer.instance = new MCPServer();
    }
    return MCPServer.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    this.setupHandlers();
    this.isInitialized = true;
  }

  // 获取服务器实例（供内部使用）
  getServerInstance(): Server {
    return this.server;
  }

  // 重置实例（主要用于测试）
  static reset(): void {
    MCPServer.instance = null;
  }

  async start(): Promise<void> {
    await this.initialize();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  async log(
    data: unknown,
    level:
      | "debug"
      | "info"
      | "notice"
      | "warning"
      | "error"
      | "critical"
      | "alert"
      | "emergency" = "info"
  ) {
    // 检查当前级别是否应该输出这条日志
    const currentPriority = this.logLevelPriority[this.currentLogLevel] || 1;
    const messagePriority = this.logLevelPriority[level] || 1;

    if (messagePriority < currentPriority) {
      return; // 跳过低优先级的日志
    }

    try {
      await this.server.sendLoggingMessage({
        level,
        data,
        logger: "routine-bot",
      });
    } catch (error) {
      console.error(
        "Failed to send logging message:",
        `[${level.toUpperCase()}] ${(error as Error).message}`
      );
    }
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

    // 实现日志级别更改
    this.server.setRequestHandler(SetLevelRequestSchema, async (request) => {
      const { level } = request.params;

      this.currentLogLevel = level;

      // 发送确认日志
      await this.log(`Logging level set to: ${level}`, "info");

      return {}; // 返回空对象表示成功
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

        case TapdToolNames.TAPD_ITERATIONS:
          return await this.handleTapdIterations(args);

        case TapdToolNames.TAPD_ITERATION_USER_TASKS:
          return await this.handleTapdIterationUserTasks(args);

        case TapdToolNames.TAPD_USER_ATTENDANCE_DAYS:
          return await this.handleTapdUserAttendanceDays(args);

        case TapdToolNames.TAPD_USER_TODO_STORY_OR_TASK_OR_BUG:
          return await this.handleTapdUserTodStoryOrTaskOrBug(args);

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

  private async handleTapdUserParticipantProjects(args?: { nick?: string }) {
    const { data } = await makeTapdRequest<TapdUserParticipantProjects>(
      "GET",
      buildUrl("workspaces/user_participant_projects", {
        nick: args?.nick || this.appConfig.tapd_nick,
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

  private async handleTapdIterations(args?: {
    workspace_id?: string;
    name?: string;
  }) {
    const workspace_id =
      args?.workspace_id || this.appConfig.tapd_default_workspace_id;

    if (!workspace_id) {
      return this.handleTapdUserParticipantProjects();
    }

    const { data } = await makeTapdRequest(
      "GET",
      buildUrl("iterations", {
        workspace_id,
        name: args?.name,
        order: encodeURIComponent("startdate desc"),
        fields: "id,name,workspace_id,startdate,enddate,status,description",
        limit: 200,
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

  private async handleTapdIterationUserTasks(args?: {
    workspace_id?: string;
    iteration_id?: string;
    name?: string;
    owner?: string;
  }) {
    const workspace_id =
      args?.workspace_id || this.appConfig.tapd_default_workspace_id;

    if (!workspace_id) {
      return await this.handleTapdUserParticipantProjects();
    }

    if (!args?.iteration_id) {
      return await this.handleTapdIterations({
        workspace_id,
        name: args?.name,
      });
    }

    const nicks: string =
      args.owner ?? this.appConfig.tapd_group_nicks
        ? this.appConfig.tapd_group_nicks.join("|")
        : this.appConfig.tapd_nick;

    const { data } = await makeTapdRequest(
      "GET",
      buildUrl("tasks", {
        workspace_id: args.workspace_id,
        iteration_id: args.iteration_id,
        owner: nicks,
        creator: nicks,
        order: encodeURIComponent("priority desc"),
        fields:
          "id,name,creator,owner,priority_label,status,progress,completed,effort_completed,exceed,remain,effort",
        limit: 200,
      })
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
      isError: true,
    };
  }

  private async handleTapdUserAttendanceDays(args: {
    workspace_id?: string;
    spentdate?: string;
  }) {
    const workspace_id =
      args?.workspace_id || this.appConfig.tapd_default_workspace_id;

    if (!workspace_id) {
      return await this.handleTapdUserParticipantProjects();
    }

    const spentdate =
      args.spentdate ?? dayjs().subtract(1, "month").format("YYYY-MM");

    const { data } = await makeTapdRequest(
      "GET",
      buildUrl("timesheets", {
        workspace_id,
        owner: this.appConfig.tapd_nick,
        spentdate: `LIKE<${spentdate}>`,
        order: encodeURIComponent("spentdate desc"),
        limit: 200,
      })
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
      isError: true,
    };
  }

  private async handleTapdUserTodStoryOrTaskOrBug(args: {
    workspace_id?: string;
    entity_type?: "story" | "task" | "bug";
  }) {
    const workspace_id =
      args.workspace_id || this.appConfig.tapd_default_workspace_id;

    if (!workspace_id) {
      return await this.handleTapdUserParticipantProjects();
    }

    if (!args.entity_type) {
      return {
        content: [
          {
            type: "text",
            text: "请指定查询的代办类型：需求(story) 或 任务(task) 或 缺陷(bug)",
          },
        ],
        isError: false,
      };
    }

    const { data } = await makeTapdRequest(
      "GET",
      buildUrl(`user_oauth/get_user_todo_${args.entity_type}`, {
        workspace_id,
				user: this.appConfig.tapd_nick,
				fields: "name,priority,severity,resolution,status,owner",
        limit: 200,
      })
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      ],
      isError: true,
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

export default MCPServer;
