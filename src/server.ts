import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  SetLevelRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { JENKINS_TOOL_DEFINITIONS } from "./tools/jenkins/index.js";
import { JenkinsJobList, JenkinsToolNames } from "./tools/jenkins/types.js";
import {
  makeGitlabRequest,
  makeJenkinsRequest,
} from "./common/utils.js";
import AppConfig from "@/config/index.js";
import {
  GitlabProject,
  GitlabToolNames,
  GitlabMergeRequest,
} from "./tools/gitlab/types.js";
import { GITLAB_TOOL_DEFINITIONS } from "./tools/gitlab/index.js";
import { Fetcher, FetchToolNames, FETCH_TOOL_DEFINITIONS } from "./tools/fetch/index.js";
import { createRoutineBotError } from "./common/errors.js";
import { waitForMergeability } from "./common/gitlab/merge.js";

function buildUrl(
  endpoint: string,
  params: Record<string, string | number | undefined>
): string {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      return `${key}=${value}`;
    })
    .join("&");

  return `${endpoint}?${query}`;
}

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
        version: "1.2.0",
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

  
  private setupHandlers() {
    // 列出所有可用工具
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        ...Object.values(JENKINS_TOOL_DEFINITIONS),
        ...Object.values(GITLAB_TOOL_DEFINITIONS),
        ...Object.values(FETCH_TOOL_DEFINITIONS),
      ],
    }));

    // 处理工具调用
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      return this.executeTool(
        name as JenkinsToolNames &
          GitlabToolNames &
          FetchToolNames,
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
    toolName: JenkinsToolNames &
      GitlabToolNames &
      FetchToolNames,
    args: any
  ) {
    try {
      switch (toolName) {
        case JenkinsToolNames.JENKINS_JOB_LIST:
          return await this.handleJenkinsJobList();

        case JenkinsToolNames.JENKINS_JOB_BUILD:
          return await this.handleJenkinsJobBuild(args);

        case GitlabToolNames.GITLAB_CREATE_MERGE_REQUEST:
          return await this.handleGitlabCreateMergeRequest(args);

        case GitlabToolNames.GITLAB_MERGE_MERGE_REQUEST:
          return await this.handleGitlabMergeMergeRequest(args);

        case FetchToolNames.FETCH_HTML:
          return await this.handleFetchHtml(args);

        case FetchToolNames.FETCH_JSON:
          return await this.handleFetchJson(args);

        case FetchToolNames.FETCH_TXT:
          return await this.handleFetchTxt(args);

        case FetchToolNames.FETCH_MARKDOWN:
          return await this.handleFetchMarkdown(args);

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

  private async handleGitlabMergeMergeRequest(args: {
    projectId: number;
    mergeRequestIid: number;
  }) {
    const { projectId, mergeRequestIid } = args;

    // === 1.等待 MR 变为可合并状态 ===
    await waitForMergeability(projectId, mergeRequestIid);

    // === 2.合并 MR ===
    const mergedMr = await makeGitlabRequest<GitlabMergeRequest>(
      "PUT",
      `projects/${projectId}/merge_requests/${mergeRequestIid}/merge`
    );

    return {
      content: [
        {
          type: "text",
          text: `✅ Merge Request 已合并。\n详情链接：${mergedMr.web_url}`,
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
    let {
      projectId,
      projectName,
      sourceBranch,
      targetBranch,
    } = args;

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
                  .map((p) => `${p.id}: ${p.name_with_namespace} (${p.web_url})`)
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
    const mr = await makeGitlabRequest<GitlabMergeRequest>(
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
          text: `✅ Merge Request 已创建。\n详情链接：${mr.web_url}\nMR IID: ${mr.iid}`,
        },
      ],
      isError: false,
    };
  }

  // Fetch 工具处理方法
  private async handleFetchHtml(args: any): Promise<any> {
    return await Fetcher.fetchHtml(args);
  }

  private async handleFetchJson(args: any): Promise<any> {
    return await Fetcher.fetchJson(args);
  }

  private async handleFetchTxt(args: any): Promise<any> {
    return await Fetcher.fetchTxt(args);
  }

  private async handleFetchMarkdown(args: any): Promise<any> {
    return await Fetcher.fetchMarkdown(args);
  }
}

export default MCPServer;
