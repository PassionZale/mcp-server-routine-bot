import { z } from 'zod';

/**
 * 请求载荷的模式定义
 */
export const RequestPayloadSchema = z.object({
  url: z.string().url('请提供有效的 URL'),
  headers: z.record(z.string()).optional(),
  max_length: z.number().int().min(0).optional().default(5000),
  start_index: z.number().int().min(0).optional().default(0),
});

/**
 * 请求载荷的类型定义
 */
export type RequestPayload = z.infer<typeof RequestPayloadSchema>;

/**
 * 工具响应的类型定义
 */
export interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError: boolean;
}

/**
 * 默认下载限制配置
 */
export const downloadLimit = {
  default: 5000,
  max: 100000,
};