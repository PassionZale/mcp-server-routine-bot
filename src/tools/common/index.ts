import { EMPTY_SCHEMA, ToolDefinition } from "@/common/types.js";
import { CommonToolNames } from "./types.js";

export const COMMON_TOOL_DEFINITIONS: Record<CommonToolNames, ToolDefinition> =
  {
    [CommonToolNames.COMMON_REFRESH_JENKINS_PROMPTS]: {
      name: CommonToolNames.COMMON_REFRESH_JENKINS_PROMPTS,
      description:
        "刷新 jenkins_job_build prompts 列表，在执行前先调用 jenkins_job_list 返回 job 列表，让用户选择，支持多选。",
      inputSchema: {
        type: "object",
        properties: {
          jobNames: {
            type: "array",
            description: "job 名称列表",
            items: {
              type: "string",
              description: "job 名成",
            },
          },
        },
        required: ["jobNames"],
      },
    },
    [CommonToolNames.COMMON_REFRESH_GITLAB_PROMPTS]: {
      name: CommonToolNames.COMMON_REFRESH_GITLAB_PROMPTS,
      description:
        "刷新 gitlab_create_merge_request prompts 列表，若 projects 没有指定，工具会返回项目列表，让用户选择，支持多选。",
      inputSchema: {
        type: "object",
        properties: {
          projects: {
            type: "array",
            description: "项目列表",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "number",
                  description: "项目ID",
                },
                name: {
                  type: "string",
                  description: "项目名称",
                },
              },
            },
          },
        },
        required: ["projects"],
      },
    },
  };
