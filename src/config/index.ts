class AppConfig {
  jenkins_base_url: string;
  jenkins_username: string;
  jenkins_access_token: string;

  gitlab_base_url: string;
  gitlab_access_token: string;

  constructor() {
    this.jenkins_base_url = process.env.JENKINS_BASE_URL || "";
    this.jenkins_username = process.env.JENKINS_USERNAME || "";
    this.jenkins_access_token = process.env.JENKINS_ACCESS_TOKEN || "";

    this.gitlab_base_url = process.env.GITLAB_BASE_URL || '';
    this.gitlab_access_token = process.env.GITLAB_ACCESS_TOKEN || "";
  }

  get configs() {
    return {
      jenkins_base_url: this.jenkins_base_url,
      jenkins_username: this.jenkins_username,
      jenkins_access_token: this.jenkins_access_token,

      gitlab_base_url: this.gitlab_base_url,
      gitlab_access_token: this.gitlab_access_token,
    };
  }
}

export default AppConfig;
