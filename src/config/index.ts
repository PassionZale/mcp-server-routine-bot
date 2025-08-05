class AppConfig {
  tapd_access_token: string;
  jenkins_access_token: string;

  constructor() {
    this.tapd_access_token = process.env.TAPD_ACCESS_TOKEN || "";
    this.jenkins_access_token = process.env.JENKINS_ACCESS_TOKEN || "";
  }

  get config() {
    return {
      tapd_access_token: this.tapd_access_token,
      jenkins_access_token: this.jenkins_access_token,
    };
  }
}

export default AppConfig;
