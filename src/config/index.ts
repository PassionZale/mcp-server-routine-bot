class AppConfig {
  current_year: string;
  tapd_nick: string;
  tapd_group_nicks: string[];
  tapd_default_workspace_id: string;
  tapd_base_url: string;
  tapd_access_token: string;
  jenkins_base_url: string;
  jenkins_access_token: string;

  constructor() {
    this.tapd_nick = process.env.TAPD_NICK || "";
    this.tapd_group_nicks = process.env.TAPD_GROUP_NICKS
      ? process.env.TAPD_GROUP_NICKS.split("|")
      : [];
    this.tapd_default_workspace_id =
      process.env.TAPD_DEFAULT_WORKSPACE_ID || "";
    this.tapd_base_url = process.env.TAPD_BASE_URL || "https://api.tapd.cn";
    this.tapd_access_token = process.env.TAPD_ACCESS_TOKEN || "";
    this.jenkins_base_url = process.env.JENKINS_BASE_URL || "";
    this.jenkins_access_token = process.env.JENKINS_ACCESS_TOKEN || "";
    this.current_year = new Date().getFullYear().toString();
  }

  get configs() {
    return {
			current_year: this.current_year,
      tapd_nick: this.tapd_nick,
      tapd_group_nicks: this.tapd_group_nicks,
      tapd_default_workspace_id: this.tapd_default_workspace_id,
      tapd_base_url: this.tapd_base_url,
      tapd_access_token: this.tapd_access_token,
      jenkins_base_url: this.jenkins_base_url,
      jenkins_access_token: this.jenkins_access_token,
    };
  }
}

export default AppConfig;
