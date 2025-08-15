import { ToolDefinition } from "@/common/types.js";
import { GitlabToolNames } from "./types.js";

export const GITLAB_TOOL_DEFINITIONS: Record<GitlabToolNames, ToolDefinition> =
  {
    [GitlabToolNames.GITLAB_CREATE_MERGE_REQUEST]: {
      name: GitlabToolNames.GITLAB_CREATE_MERGE_REQUEST,
      description: `
			在 GitLab 中创建 Merge Request。

			!!!IMPORTANT!!!
			如果 projectId projectName sourceBranch 等关键信息没有指定，并且当前处于 Git 仓库中，则优先使用 Git 检查当前仓库的状态：

			- projectId 和 projectName 都未指定，获取当前仓库的 Git 远程 URL，解析出其中的项目名（projectName.git），作为 projectName;
			- sourceBranch 未指定，则获取当前仓库的分支名称作为 sourceBranch;
			`,
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
