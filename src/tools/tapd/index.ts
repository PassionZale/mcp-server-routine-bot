import { ToolDefinition, EMPTY_SCHEMA } from "@/common/types.js";
import { TapdToolNames } from "./types.js";

export const TAPD_TOOL_DEFINITIONS: Record<TapdToolNames, ToolDefinition> = {
  [TapdToolNames.TAPD_USERS_INFO]: {
    name: TapdToolNames.TAPD_USERS_INFO,
    description: "获取 TAPD 当前用户信息",
    inputSchema: EMPTY_SCHEMA,
  },
  [TapdToolNames.TAPD_USER_PARTICIPANT_PROJECTS]: {
    name: TapdToolNames.TAPD_USER_PARTICIPANT_PROJECTS,
    description:
      "获取 TAPD 用户参与的项目列表（无分页），如果用户进行 TAPD 操作时，没有指定项目ID（workspace_id），可以调用这个工具获取，一次返回所有符合条件的值,只能传用户 nick 参数，一次只能查一个用户。",
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
  [TapdToolNames.TAPD_ITERATIONS]: {
    name: TapdToolNames.TAPD_ITERATIONS,
    description: `
		获取 TAPD 指定项目的迭代列表，不分页，最多查询 200，默认按迭代开始日期降序。

		!!! IMPORTANT !!!
		- 如果 workspace_id 没有给定，则使用环境变量 TAPD_DEFAULT_WORKSPACE_ID
		- 如果 TAPD_DEFAULT_WORKSPACE_ID 也没有设置，则调用 tapd_user_participant_projects 让用户选择一个项目
		`,
    inputSchema: {
      type: "object",
      properties: {
        workspace_id: {
          type: "string",
          description: "项目ID",
        },
        name: {
          type: "string",
          description: "迭代的标题，支持模糊查询",
        },
      },
    },
  },
  [TapdToolNames.TAPD_ITERATION_USER_TASKS]: {
    name: TapdToolNames.TAPD_ITERATION_USER_TASKS,
    description: `
		获取 TAPD 迭代中成员或成员组的任务，根据查询的结果进行总结，给出清晰的数据统计概览，常用于每周进度汇总。

		!!! IMPORTANT !!!
		- 如果 workspace_id 没有给定，则使用环境变量 TAPD_DEFAULT_WORKSPACE_ID
		- 如果 iteration_id 没有给定，则先调用 tapd_iterations 查询 workspace_id + name 下匹配的迭代，让用户选择
		- 如果 owner 没有给定，则使用环境变量 TAPD_GROUP_NICKS，如果 TAPD_GROUP_NICKS 没有定义，则继续使用 TAPD_NICK

		示例：

		## 数据概览

		1. 总体情况
			- 共有X个负责人
			- 总计X个任务
			- 完成率情况（高或低或正常）：X个已完成，Y个未完成
		2. 项目风险
			项目风险按照所给定成员的任务数量、开始情况、完成情况，分析出哪些成员可能会存在瓶颈，这些瓶颈且有风险的任务大概有哪些模块

		## 成员任务

		status 枚举值对照为 open（未开始）、progressing（进行中）、done（已完成），在展示 status 时，使用对应的 value 进行填充

		成员1

		-  {【priority_label】} {name} 【{status}】 {process%}

		成员2

		-  {【priority_label】} {name} {status} {process%}

		等等...
		`,
    inputSchema: {
      type: "object",
      properties: {
        workspace_id: {
          type: "string",
          description: "项目ID",
        },
        iteration_id: {
          type: "string",
          description: "迭代ID",
        },
        name: {
          type: "string",
          descriptions: "迭代标题，支持模糊查询",
        },
        owner: {
          type: "string",
          description:
            "任务拥有者，可以传递多个成员昵称，多个成员昵称使用 | 拼接",
        },
      },
    },
  },
  [TapdToolNames.TAPD_TIMESHEETS]: {
    name: TapdToolNames.TAPD_TIMESHEETS,
    description: "返回指定时间段的工时（用于统计上月工时汇总）",
    inputSchema: EMPTY_SCHEMA,
  },
  [TapdToolNames.TAPD_USER_TODO_TASK]: {
    name: TapdToolNames.TAPD_USER_TODO_TASK,
    description: "返回用户待办的任务（分页显示，默认一页30条）",
    inputSchema: EMPTY_SCHEMA,
  },
  [TapdToolNames.TAPD_USER_TODO_BUG]: {
    name: TapdToolNames.TAPD_USER_TODO_BUG,
    description: "返回用户待办的缺陷（分页显示，默认一页30条）",
    inputSchema: EMPTY_SCHEMA,
  },
};

/**
 * 多维表 内容填充
 *
 * - 先查询迭代的自定义字段
 * 	- https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/iteration/get_iteration_custom_fields_settings.html
 *
 * - 通过 workspace_id + name(迭代标题，支持模糊匹配) 查询出迭代
 * 	- https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/iteration/get_iterations.html
 * 	- { id, name, workspace_id, description, creator }
 *
 * - 通过 workspace_id + iteration_id + owner(枚举) 查询成员的任务列表
 * 	- https://open.tapd.cn/document/api-doc/API%E6%96%87%E6%A1%A3/api_reference/task/get_tasks.html
 * 	-
 */
