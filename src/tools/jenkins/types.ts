export enum JenkinsToolNames {
	JENKINS_JOB_LIST = "jenkins_job_list",
  JENKINS_JOB_BUILD = "jenkins_job_build",
}

export interface JenkinsJobList {
  _class: string;
  jobs: { name: string; _class: string }[];
}
