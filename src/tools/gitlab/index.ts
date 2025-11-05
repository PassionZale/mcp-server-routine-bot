import { ToolDefinition } from "@/common/types.js";
import { GitlabToolNames } from "./types.js";

export const GITLAB_TOOL_DEFINITIONS: Record<GitlabToolNames, ToolDefinition> =
  {
    [GitlabToolNames.GITLAB_CREATE_MERGE_REQUEST]: {
      name: GitlabToolNames.GITLAB_CREATE_MERGE_REQUEST,
      description: '在 GitLab 中创建 Merge Request',
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "number",
            description: "项目ID",
          },
          projectName: {
            type: "string",
            description: "项目名称",
          },
          sourceBranch: {
            type: "string",
            description: "源分支名称",
          },
          targetBranch: {
            type: "string",
            description: "目标分支名称",
          },
        },
      },
    },
    [GitlabToolNames.GITLAB_MERGE_MERGE_REQUEST]: {
      name: GitlabToolNames.GITLAB_MERGE_MERGE_REQUEST,
      description: `在 GitLab 中合并指定的 Merge Request`,
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "number",
            description: "项目ID",
          },
          mergeRequestIid: {
            type: "number",
            description: "Merge Request 的 IID",
          },
        },
        required: ["projectId", "mergeRequestIid"],
      },
    },
  };
