import appConfig from "@/config/index.js";
import { createRoutineBotError } from "./errors.js";
import { TapdResponse } from "./types.js";

type RequestOptions = {
  method?: string;
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
  baseUrl: string,
  params: Record<string, string | number | undefined>
): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, value.toString());
    }
  });
  return url.toString();
}

export async function makeTapdRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<TapdResponse<T>> {
  const {
    config: { tapd_access_token },
  } = appConfig;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Via: "mcp-server-routine-bot",
    ...options.headers,
  };

  if (tapd_access_token) {
    headers["Authorization"] = `Bearer ${tapd_access_token}`;
  }

  const response = await fetch(`https://api.tapd.cn/${endpoint}`, {
    method: options.method || "GET",
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

  return data;
}

export async function makeJenkinsRequest() {
  const {
    config: { jenkins_access_token },
  } = appConfig;

  if (!jenkins_access_token) {
    console.error("JENKINS_ACCESS_TOKEN environment variable is not set");
    process.exit(1);
  }
}
