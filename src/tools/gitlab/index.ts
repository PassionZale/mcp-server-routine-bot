import { ToolDefinition } from "@/common/types.js";
import { GitlabToolNames } from "./types.js";

export const GITLAB_TOOL_DEFINITIONS: Record<GitlabToolNames, ToolDefinition> =
  {
    [GitlabToolNames.GITLAB_CREATE_MERGE_REQUEST]: {
      name: GitlabToolNames.GITLAB_CREATE_MERGE_REQUEST,
      description: "在 GitLab 中创建 Merge Request",
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "number",
            description: "GitLab 项目的ID",
          },
          projectName: {
            type: "string",
            description: "GitLab 项目的名称",
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
  };
