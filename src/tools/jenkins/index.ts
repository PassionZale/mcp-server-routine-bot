import { ToolDefinition, EMPTY_SCHEMA } from "@/common/types.js";
import { JenkinsToolNames } from "./types.js";

export const JENKINS_TOOL_DEFINITIONS: Record<
  JenkinsToolNames,
  ToolDefinition
> = {
  [JenkinsToolNames.JENKINS_CREATE_MERGE_REQUEST]: {
    name: JenkinsToolNames.JENKINS_CREATE_MERGE_REQUEST,
    description: "创建 merge request",
    inputSchema: EMPTY_SCHEMA,
  },
};
