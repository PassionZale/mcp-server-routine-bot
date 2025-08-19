import { EMPTY_SCHEMA, ToolDefinition } from "@/common/types.js";
import { CommonToolNames } from "./types.js";

export const COMMON_TOOL_DEFINITIONS: Record<CommonToolNames, ToolDefinition> =
  {
    [CommonToolNames.COMMON_REFRESH_PROMPTS]: {
      name: CommonToolNames.COMMON_REFRESH_PROMPTS,
      description: "刷新 prompts 列表",
      inputSchema: EMPTY_SCHEMA,
    },
  };
