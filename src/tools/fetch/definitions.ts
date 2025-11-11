import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Fetch 工具名称枚举
 */
export enum FetchToolNames {
  FETCH_HTML = "fetch_html",
  FETCH_JSON = "fetch_json",
  FETCH_TXT = "fetch_txt",
  FETCH_MARKDOWN = "fetch_markdown",
}

/**
 * Fetch 工具定义
 */
export const FETCH_TOOL_DEFINITIONS: Record<FetchToolNames, Tool> = {
  [FetchToolNames.FETCH_HTML]: {
    name: FetchToolNames.FETCH_HTML,
    description: "获取网页的原始 HTML 内容。返回指定 URL 的完整 HTML 源代码。",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "要抓取的网站 URL（必须以 http:// 或 https:// 开头）",
        },
        headers: {
          type: "object",
          description: "可选的自定义请求头",
          additionalProperties: {
            type: "string",
          },
        },
        max_length: {
          type: "number",
          description: "返回内容的最大字符数限制（默认：5000）",
          minimum: 0,
        },
        start_index: {
          type: "number",
          description: "从第几个字符开始返回（默认：0）",
          minimum: 0,
        },
      },
      required: ["url"],
    },
  },

  [FetchToolNames.FETCH_JSON]: {
    name: FetchToolNames.FETCH_JSON,
    description: "从指定 URL 抓取 JSON 文件并解析。返回格式化的 JSON 内容。",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "要抓取的 JSON 文件 URL（必须以 http:// 或 https:// 开头）",
        },
        headers: {
          type: "object",
          description: "可选的自定义请求头",
          additionalProperties: {
            type: "string",
          },
        },
        max_length: {
          type: "number",
          description: "返回内容的最大字符数限制（默认：5000）",
          minimum: 0,
        },
        start_index: {
          type: "number",
          description: "从第几个字符开始返回（默认：0）",
          minimum: 0,
        },
      },
      required: ["url"],
    },
  },

  [FetchToolNames.FETCH_TXT]: {
    name: FetchToolNames.FETCH_TXT,
    description: "获取网页纯文本内容，自动移除 HTML 标签、脚本和样式表。返回清理后的文本内容。",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "要抓取的网站 URL（必须以 http:// 或 https:// 开头）",
        },
        headers: {
          type: "object",
          description: "可选的自定义请求头",
          additionalProperties: {
            type: "string",
          },
        },
        max_length: {
          type: "number",
          description: "返回内容的最大字符数限制（默认：5000）",
          minimum: 0,
        },
        start_index: {
          type: "number",
          description: "从第几个字符开始返回（默认：0）",
          minimum: 0,
        },
      },
      required: ["url"],
    },
  },

  [FetchToolNames.FETCH_MARKDOWN]: {
    name: FetchToolNames.FETCH_MARKDOWN,
    description: "将网页内容转换为 Markdown 格式。自动将 HTML 结构转换为对应的 Markdown 语法。",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "要抓取的网站 URL（必须以 http:// 或 https:// 开头）",
        },
        headers: {
          type: "object",
          description: "可选的自定义请求头",
          additionalProperties: {
            type: "string",
          },
        },
        max_length: {
          type: "number",
          description: "返回内容的最大字符数限制（默认：5000）",
          minimum: 0,
        },
        start_index: {
          type: "number",
          description: "从第几个字符开始返回（默认：0）",
          minimum: 0,
        },
      },
      required: ["url"],
    },
  },
};