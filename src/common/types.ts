// https://open.tapd.cn/document/api-doc/API文档/使用必读.html

export interface TapdResponse<T> {
  /** 返回的状态。1 代表请求成功，其它代表失败 */
  status: number;
  /** 返回说明。如果出错，这里会给出出错信息 */
  info: string;
  /** 数据部分 */
  data: T;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export const EMPTY_SCHEMA = {
  type: "object" as const,
  properties: {},
  additionalProperties: false,
} as const;

export interface PromptDefinition {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}
