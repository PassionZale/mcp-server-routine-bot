export enum JenkinsToolNames {
  JENKINS_JOB_BUILD = "jenkins-job-build",
}

export interface JenkinsJobList {
  _class: string;
  jobs: { name: string; _class: string }[];
}
