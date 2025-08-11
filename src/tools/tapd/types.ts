export enum TapdToolNames {
  TAPD_USERS_INFO = "tapd_users_info",
  TAPD_USER_PARTICIPANT_PROJECTS = "tapd_user_participant_projects",
  TAPD_ITERATIONS = "tapd_iterations",
  TAPD_ITERATION_USER_TASKS = "tapd_iteration_user_tasks",
  TAPD_USER_ATTENDANCE_DAYS = "tapd_user_attendance_days",
  TAPD_USER_TODO_STORY_OR_BUG = "tapd_user_todo_story_or_bug",
}

export interface TapdUsersInfo {
  /** 用户ID */
  id: string;
  /** 英文ID(nick和id都能作为用户的唯一标识) */
  nick: string;
  /** 中文名 */
  name: string;
  /** 头像 */
  avatar: string;
  /** 是否有效: 1-是;0-否 */
  enabled: 1 | 0;
  /** 状态: 1-在职;2-离职;3-冻结 */
  status_id: 1 | 2 | 3;
  /** 状态名 */
  status_name: string;
}

export type TapdUserParticipantProjects = {
  Workspace: {
    /** 项目 id */
    id: string;
    /** 项目名称 */
    name: string;
    /** 项目英文昵称 */
    pretty_name: string;
    /** 项目类别 */
    category: string;
    /** 项目状态 */
    status: string;
    /** 项目描述 */
    description: string;
    /** 开始时间 */
    begin_date: string;
    /** 结束时间 */
    end_date: string;
    /** 是否开通外网 */
    external_on: string;
    /** 项目创建者的名字 */
    creator: string;
    /** 项目创建时间 */
    created: string;
  };
}[];
