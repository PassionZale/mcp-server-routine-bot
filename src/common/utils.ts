import { createRoutineBotError } from "./errors.js";
import { TapdResponse } from "./types.js";
import AppConfig from "@/config/index.js";
import MCPServer from "@/server.js";

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
  params: Record<string, string | number | undefined>
): string {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      return `${key}=${value}`;
    })
    .join("&");

  return `${endpoint}?${query}`;
}

export async function makeTapdRequest<T>(
  method: "GET" | "POST",
  endpoint: string,
  options: RequestOptions = {}
): Promise<TapdResponse<T>> {
  const appConfig = new AppConfig();
  const mcpServer = MCPServer.getInstance();

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

  await mcpServer.log(data);

  if (data.status !== 1) {
    throw createRoutineBotError(400, { message: data.info });
  }

  return data;
}

export async function makeJenkinsRequest<T>(
  method: "GET" | "POST",
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const appConfig = new AppConfig();
  const mcpServer = MCPServer.getInstance();

  const {
    configs: { jenkins_base_url, jenkins_username, jenkins_access_token },
  } = appConfig;

  if (!jenkins_base_url) {
    throw createRoutineBotError(422, {
      message: "JENKINS_BASE_URL environment variable is not set",
    });
  }

  if (!jenkins_username) {
    throw createRoutineBotError(422, {
      message: "JENKINS_USERNAME environment variable is not set",
    });
  }

  if (!jenkins_access_token) {
    throw createRoutineBotError(422, {
      message: "JENKINS_ACCESS_TOKEN environment variable is not set",
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  headers["Authorization"] =
    "Basic " +
    Buffer.from(`${jenkins_username}:${jenkins_access_token}`).toString(
      "base64"
    );

  const response = await fetch(`${jenkins_base_url}/${endpoint}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw createRoutineBotError(response.status, responseBody);
  }

  const data = responseBody as T;

  await mcpServer.log(data);

  return data;
}

export async function makeGitlabRequest<T>(
  method: "GET" | "POST",
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const appConfig = new AppConfig();
  const mcpServer = MCPServer.getInstance();

  const {
    configs: { gitlab_base_url, gitlab_access_token },
  } = appConfig;

  if (!gitlab_base_url) {
    throw createRoutineBotError(422, {
      message: "GITLAB_BASE_URL environment variable is not set",
    });
  }

  if (!gitlab_access_token) {
    throw createRoutineBotError(422, {
      message: "GITLAB_ACCESS_TOKEN environment variable is not set",
    });
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  headers["PRIVATE-TOKEN"] = `${gitlab_access_token}`;

  const response = await fetch(`${gitlab_base_url}/api/v4/${endpoint}`, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const responseBody = await parseResponseBody(response);

  if (!response.ok) {
    throw createRoutineBotError(response.status, responseBody);
  }

  const data = responseBody as T;

  await mcpServer.log(data);

  return data;
}
