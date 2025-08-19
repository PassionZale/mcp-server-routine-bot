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
  TapdUserTask,
} from "./tools/tapd/types.js";
import { JENKINS_TOOL_DEFINITIONS } from "./tools/jenkins/index.js";
import { JenkinsJobList, JenkinsToolNames } from "./tools/jenkins/types.js";
import {
  buildUrl,
  makeGitlabRequest,
  makeJenkinsRequest,
  makeTapdRequest,
} from "./common/utils.js";
import AppConfig from "@/config/index.js";
import dayjs from "dayjs";
import {
  GitlabMergeReqeust,
  GitlabProject,
  GitlabToolNames,
} from "./tools/gitlab/types.js";
import { GITLAB_TOOL_DEFINITIONS } from "./tools/gitlab/index.js";
import { createRoutineBotError } from "./common/errors.js";
import { groupTasksByOwner } from "./common/tapd/task.js";
import { COMMON_TOOL_DEFINITIONS } from "./tools/common/index.js";
import { CommonToolNames } from "./tools/common/types.js";

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

    console.error("MCP Routine Bot Server running on stdio");
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
        ...Object.values(COMMON_TOOL_DEFINITIONS),
        ...Object.values(TAPD_TOOL_DEFINITIONS),
        ...Object.values(JENKINS_TOOL_DEFINITIONS),
        ...Object.values(GITLAB_TOOL_DEFINITIONS),
      ],
    }));

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      return this.executeTool(
        name as CommonToolNames &
          TapdToolNames &
          JenkinsToolNames &
          GitlabToolNames,
        args
      );
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
        case CommonToolNames.COMMON_REFRESH_PROMPTS:
          return await this.handleCommonRefreshPrompts();

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

        case TapdToolNames.TAPD_USER_TODO_STORY_OR_BUG:
          return await this.handleTapdUserTodStoryOrBug(args);

        case JenkinsToolNames.JENKINS_JOB_LIST:
          return await this.handleJenkinsJobList();

        case JenkinsToolNames.JENKINS_JOB_BUILD:
          return await this.handleJenkinsJobBuild(args);

        case GitlabToolNames.GITLAB_CREATE_MERGE_REQUEST:
          return await this.handleGitlabCreateMergeRequest(args);

        default:
          throw new Error(`Tool ${toolName} not implemented`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error executing ${toolName}: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleCommonRefreshPrompts() {
    return {
      content: [
        {
          type: "text",
          text: "刷新成功",
        },
      ],
      isError: false,
    };
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
        fields: "id,name,description",
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

    const { data } = await makeTapdRequest<Array<{ Task: TapdUserTask }>>(
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

    const result = groupTasksByOwner(data);

    return {
      content: [
        {
          type: "text",
          text: result.formattedOutput,
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

  private async handleTapdUserTodStoryOrBug(args: {
    workspace_id?: string;
    entity_type?: "story" | "bug";
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
            text: "请指定查询的代办类型：需求/任务(story) 或 缺陷(bug)",
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
        order: encodeURIComponent("priority desc"),
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

  private async handleJenkinsJobList() {
    const { jobs } = await makeJenkinsRequest<JenkinsJobList>(
      "GET",
      "api/json?tree=jobs[name]"
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(jobs, null, 2),
        },
      ],
      isError: false,
    };
  }

  private async handleJenkinsJobBuild(args: { jobName?: string }) {
    if (!args.jobName) {
      return this.handleJenkinsJobList();
    }

    await makeJenkinsRequest("POST", `job/${args.jobName}/build`);

    return {
      content: [
        {
          type: "text",
          text: `✅ Jenkins Job "${args.jobName}" 构建已触发。\n详情链接：${this.appConfig.jenkins_base_url}/job/${args.jobName}`,
        },
      ],
      isError: false,
    };
  }

  private async handleGitlabCreateMergeRequest(args: {
    projectId?: string;
    projectName?: string;
    sourceBranch?: string;
    targetBranch?: string;
  }) {
    let { projectId, projectName, sourceBranch, targetBranch } = args;

    let project: GitlabProject | null = null;

    if (projectId) {
      project = await makeGitlabRequest<GitlabProject>(
        "GET",
        `projects/${projectId}`
      );
    } else {
      if (!projectName) {
        throw createRoutineBotError(422, "项目名称未指定");
      }

      const projects = await makeGitlabRequest<GitlabProject[]>(
        "GET",
        buildUrl("projects", {
          search: projectName,
        })
      );

      if (!projects.length) {
        throw createRoutineBotError(400, `未找到项目: ${projectName}`);
      }

      if (projects.length === 1) {
        project = projects[0];
      }

      if (projects.length > 1) {
        return {
          content: [
            {
              type: "text",
              text:
                `找到多个项目，请选择一个：\n` +
                projects
                  .map(
                    (p, i) => `${p.id}: ${p.name_with_namespace} (${p.web_url})`
                  )
                  .join("\n"),
            },
          ],
          isError: false,
        };
      }
    }

    if (!project) {
      throw createRoutineBotError(422, `未找到对应项目`);
    }

    if (!sourceBranch) {
      throw createRoutineBotError(422, `源分支名称未指定`);
    }

    if (!targetBranch) {
      targetBranch = project.default_branch || "main";
    }

    // === 创建 MR ===
    const mr = await makeGitlabRequest<GitlabMergeReqeust>(
      "POST",
      `projects/${project.id}/merge_requests`,
      {
        body: {
          source_branch: sourceBranch,
          target_branch: targetBranch,
          title: `Merge ${sourceBranch} into ${targetBranch} Via mcp-server-routine-bot`,
        },
      }
    );

    return {
      content: [
        {
          type: "text",
          text: `✅ Merge Request 已创建。\n详情链接：${mr.web_url}`,
        },
      ],
      isError: false,
    };
  }
}

export default MCPServer;
