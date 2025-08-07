import { ToolDefinition, EMPTY_SCHEMA } from "@/common/types.js";
import { TapdToolNames } from "./types.js";

export const TAPD_TOOL_DEFINITIONS: Record<TapdToolNames, ToolDefinition> = {
  [TapdToolNames.TAPD_USERS_INFO]: {
    name: TapdToolNames.TAPD_USERS_INFO,
    description: "获取当前用户信息",
    inputSchema: EMPTY_SCHEMA,
  },
  [TapdToolNames.TAPD_USER_PARTICIPANT_PROJECTS]: {
    name: TapdToolNames.TAPD_USER_PARTICIPANT_PROJECTS,
    description:
      "获取用户参与的项目列表（无分页），如果用户进行 TAPD 操作时，没有指定 workspace_id，可以调用这个工具获取，一次返回所有符合条件的值,只能传用户 nick 参数，一次只能查一个用户。",
    inputSchema: {
      type: "object",
      properties: {
        nick: {
          type: "string",
          description: "成员昵称",
        },
      },
    },
  },
};
