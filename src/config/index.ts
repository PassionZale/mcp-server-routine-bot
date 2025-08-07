class AppConfig {
  tapd_nick: string;
  tapd_access_token: string;

  jenkins_access_token: string;

  constructor() {
    this.tapd_nick = process.env.TAPD_NICK || "";
    this.tapd_access_token = process.env.TAPD_ACCESS_TOKEN || "";

    this.jenkins_access_token = process.env.JENKINS_ACCESS_TOKEN || "";
  }

  get configs() {
    return {
      tapd_nick: this.tapd_nick,
      tapd_access_token: this.tapd_access_token,

      jenkins_access_token: this.jenkins_access_token,
    };
  }
}

export default AppConfig;
