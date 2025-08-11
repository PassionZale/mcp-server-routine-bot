import { EMPTY_SCHEMA, ToolDefinition } from "@/common/types.js";
import { JenkinsToolNames } from "./types.js";

export const JENKINS_TOOL_DEFINITIONS: Record<
  JenkinsToolNames,
  ToolDefinition
> = {
  [JenkinsToolNames.JENKINS_JOB_LIST]: {
    name: JenkinsToolNames.JENKINS_JOB_LIST,
    description: "获取 Jenkins Job 列表",
    inputSchema: EMPTY_SCHEMA,
  },
  [JenkinsToolNames.JENKINS_JOB_BUILD]: {
    name: JenkinsToolNames.JENKINS_JOB_BUILD,
    description:
      "触发 Jenkins Job 构建。如果 jobName 未提供，则调用 jenkins_job_list 返回 job 列表，让用户选择",
    inputSchema: {
      type: "object",
      properties: {
        jobName: {
          type: "string",
          description: "要构建的 Jenkins Job 名称（必填）",
        },
      },
      required: ["jobName"],
    },
  },
};
