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
  [TapdToolNames.TAPD_USER_ATTENDANCE_DAYS]: {
    name: TapdToolNames.TAPD_USER_ATTENDANCE_DAYS,
    description: `
			获取 TAPD 用户指定月份内的工时登记天数或出勤天数，月份格式为 YYYY-MM（例如 2025-07）。
			
			!!! IMPORTANT !!!
			- 如果 workspace_id 没有给定，则使用环境变量 TAPD_DEFAULT_WORKSPACE_ID
			- 如果 spentdate 没有给定，则默认使用上个月
			- 拿到返回值，按照 spentdate 去重并计算出总数 count
			- 最终返回去重后的总数，返回示例：{spenddate} 共出勤 {count} 天
			`,
    inputSchema: {
      type: "object",
      properties: {
        workspace_id: {
          type: "string",
          description: "项目ID",
        },
        spentdate: {
          type: "string",
          description: "月份（格式 YYYY-MM，例如 2025-07）",
        },
      },
    },
  },
  [TapdToolNames.TAPD_USER_TODO_STORY_OR_TASK_OR_BUG]: {
    name: TapdToolNames.TAPD_USER_TODO_STORY_OR_TASK_OR_BUG,
    description: `
			获取 TAPD 用户代办的需求（story）或任务（task）或缺陷（bug）。

			!!! IMPORTANT !!!
			- 如果 workspace_id 没有给定，则使用环境变量 TAPD_DEFAULT_WORKSPACE_ID
		`,
    inputSchema: {
      type: "object",
      properties: {
        workspace_id: {
          type: "string",
          description: "项目ID",
        },
        entity_type: {
          type: "string",
          description: " 待办类型，需求(story) 或 任务(task) 或 缺陷(bug)",
        },
      },
    },
  },
};
