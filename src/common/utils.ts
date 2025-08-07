import { createRoutineBotError } from "./errors.js";
import { TapdResponse } from "./types.js";
import AppConfig from "@/config/index.js";
import server from "@/server.js";

type RequestOptions = {
  body?: unknown;
  headers?: Record<string, string>;
};

async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export function buildUrl(
  endpoint: string,
  params: Record<string, string | number | undefined>,
  target: "tapd" | "jenkins" = "tapd"
): string {
  const appConfig = new AppConfig();

  const {
    configs: { tapd_base_url, jenkins_base_url },
  } = appConfig;

  const baseUrl = target === "tapd" ? tapd_base_url : jenkins_base_url;

  const url = new URL(`${baseUrl}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, value.toString());
    }
  });
  return url.toString();
}

export async function makeTapdRequest<T>(
  method: "GET" | "POST",
  endpoint: string,
  options: RequestOptions = {}
): Promise<TapdResponse<T>> {
  const appConfig = new AppConfig();

  const {
    configs: { tapd_nick, tapd_access_token, tapd_base_url },
  } = appConfig;

  if (!tapd_access_token) {
    throw createRoutineBotError(422, {
      message: "TAPD_ACCESS_TOKEN environment variable is not set",
    });
  }

  if (!tapd_nick) {
    throw createRoutineBotError(422, {
      message: "TAPD_NICK environment variable is not set",
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Via: "mcp-server-routine-bot",
    ...options.headers,
  };

  if (tapd_access_token) {
    headers["Authorization"] = `Bearer ${tapd_access_token}`;
  }

  const response = await fetch(`${tapd_base_url}/${endpoint}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw createRoutineBotError(response.status, responseBody);
  }

  const data = responseBody as TapdResponse<T>;

  if (data.status !== 1) {
    throw createRoutineBotError(400, { message: data.info });
  }

  server.log({
    level: "info",
    data,
  });

  return data;
}

export async function makeJenkinsRequest() {
  const appConfig = new AppConfig();

  const {
    configs: { jenkins_base_url, jenkins_access_token },
  } = appConfig;

  if (!jenkins_base_url) {
    throw createRoutineBotError(422, {
      message: "JENKINS_BASE_URL environment variable is not set",
    });
  }

  if (!jenkins_access_token) {
    throw createRoutineBotError(422, {
      message: "JENKINS_ACCESS_TOKEN environment variable is not set",
    });
  }
}
