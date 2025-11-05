export enum GitlabToolNames {
  GITLAB_CREATE_MERGE_REQUEST = "gitlab_create_merge_request",
  GITLAB_MERGE_MERGE_REQUEST = "gitlab_merge_merge_request",
}

export interface GitlabProject {
  id: number;
  name: string;
  name_with_namespace: string;
  path: string;
  path_with_namespace: string;
  web_url: string;
  default_branch: string;
}

export interface GitlabMergeRequest {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  state: string;
  merge_status: string;
  detailed_merge_status?: string; // 可选，GitLab 15.6+
  web_url: string;
  source_branch: string;
  target_branch: string;
  merge_when_pipeline_succeeds: boolean;
  draft?: boolean;
  work_in_progress?: boolean; // 旧版本的草稿标识
  blocking_discussions_resolved?: boolean;
  pipeline?: {
    id: number;
    status: string;
  };
  approvals_before_merge?: number;
  approvals?: {
    approved: boolean;
    approvals_required: number;
    approvals_left: number;
  };
}

export enum MergeStatus {
  CAN_BE_MERGED = "can_be_merged",
  CANNOT_BE_MERGED = "cannot_be_merged",
  UNCHECKED = "unchecked",
}

export enum DetailedMergeStatus {
  BLOCKED_STATUS = "blocked_status",
  BROKEN_STATUS = "broken_status",
  CHECKING = "checking",
  CI_MUST_PASS = "ci_must_pass",
  CI_STILL_RUNNING = "ci_still_running",
  DISCUSSIONS_NOT_RESOLVED = "discussions_not_resolved",
  DRAFT_STATUS = "draft_status",
  EXTERNAL_STATUS_CHECKS = "external_status_checks",
  MERGEABLE = "mergeable",
  NOT_APPROVED = "not_approved",
  NOT_OPEN = "not_open",
  POLICIES_DENIED = "policies_denied",
}
