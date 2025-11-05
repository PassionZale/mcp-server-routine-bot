import { EMPTY_SCHEMA, ToolDefinition } from "@/common/types.js";
import { JenkinsToolNames } from "./types.js";

export const JENKINS_TOOL_DEFINITIONS: Record<
  JenkinsToolNames,
  ToolDefinition
> = {
  [JenkinsToolNames.JENKINS_JOB_LIST]: {
    name: JenkinsToolNames.JENKINS_JOB_LIST,
    description: "查询 Jenkins Job 列表",
    inputSchema: EMPTY_SCHEMA,
  },
  [JenkinsToolNames.JENKINS_JOB_BUILD]: {
    name: JenkinsToolNames.JENKINS_JOB_BUILD,
    description: "构建 Jenkins Job",
    inputSchema: {
      type: "object",
      properties: {
        jobName: {
          type: "string",
          description: "Jenkins Job 名称",
        },
      },
      required: ["jobName"],
    },
  },
};
