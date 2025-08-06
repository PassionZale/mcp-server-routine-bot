import { TapdUserInfo } from "@/common/types.js";
import { makeTapdRequest } from "@/common/utils.js";

class AppConfig {
  tapd_access_token: string;
  tapd_userinfo: TapdUserInfo | undefined;
  jenkins_access_token: string;

  constructor() {
    this.tapd_access_token = process.env.TAPD_ACCESS_TOKEN || "";
    this.jenkins_access_token = process.env.JENKINS_ACCESS_TOKEN || "";
    this.tapd_userinfo = undefined;

    this.getTapdUserInfo();
  }

  get config() {
    return {
      tapd_access_token: this.tapd_access_token,
      tapd_userinfo: this.tapd_userinfo,
      jenkins_access_token: this.jenkins_access_token,
    };
  }

  private getTapdUserInfo() {
    makeTapdRequest<TapdUserInfo>("GET", "/users/info").then(({ data }) => {
      this.tapd_userinfo = data;
    });
  }
}

const appConfig = new AppConfig();

export default appConfig;
