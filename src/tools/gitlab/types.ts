export enum GitlabToolNames {
  GITLAB_CREATE_MERGE_REQUEST = "gitlab_create_merge_request",
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

export interface GitlabMergeReqeust {
	web_url: string
}