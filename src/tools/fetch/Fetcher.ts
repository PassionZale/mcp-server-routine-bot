import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import isIPPrivate from 'private-ip';
import { ProxyAgent } from 'undici';
import { RequestPayload, ToolResponse, downloadLimit } from './types.js';

/**
 * Fetcher 类提供了多种网页内容抓取功能
 * 包括获取 HTML、JSON、纯文本和 Markdown 格式的内容
 */
export class Fetcher {
  /**
   * 获取网页的原始 HTML 内容
   */
  static async fetchHtml(args: RequestPayload): Promise<ToolResponse> {
    try {
      const validatedArgs = this.validateArgs(args);
      const content = await this._fetch(validatedArgs);
      const limitedContent = this.applyLengthLimits(content, validatedArgs.max_length, validatedArgs.start_index);

      return {
        content: [{ type: 'text', text: limitedContent }],
        isError: false,
      };
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  /**
   * 获取并解析 JSON 文件
   */
  static async fetchJson(args: RequestPayload): Promise<ToolResponse> {
    try {
      const validatedArgs = this.validateArgs(args);
      const content = await this._fetch(validatedArgs);
      const limitedContent = this.applyLengthLimits(content, validatedArgs.max_length, validatedArgs.start_index);

      // 尝试解析 JSON 以验证其有效性，然后重新序列化
      const parsedJson = JSON.parse(limitedContent);
      const jsonString = JSON.stringify(parsedJson, null, 2);

      return {
        content: [{ type: 'text', text: jsonString }],
        isError: false,
      };
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  /**
   * 获取网页纯文本内容（移除 HTML 标签、脚本和样式）
   */
  static async fetchTxt(args: RequestPayload): Promise<ToolResponse> {
    try {
      const validatedArgs = this.validateArgs(args);
      const content = await this._fetch(validatedArgs);

      // 使用 JSDOM 解析 HTML 并提取文本
      const dom = new JSDOM(content);
      const document = dom.window.document;

      // 移除 script 和 style 标签
      const scripts = document.querySelectorAll('script, style');
      scripts.forEach(element => element.remove());

      // 提取文本内容并规范化空白字符
      const textContent = document.body?.textContent || '';
      const normalizedText = textContent.replace(/\s+/g, ' ').trim();

      const limitedContent = this.applyLengthLimits(normalizedText, validatedArgs.max_length, validatedArgs.start_index);

      return {
        content: [{ type: 'text', text: limitedContent }],
        isError: false,
      };
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  /**
   * 将网页内容转换为 Markdown 格式
   */
  static async fetchMarkdown(args: RequestPayload): Promise<ToolResponse> {
    try {
      const validatedArgs = this.validateArgs(args);
      const content = await this._fetch(validatedArgs);

      // 使用 TurndownService 将 HTML 转换为 Markdown
      const turndownService = new TurndownService({
        headingStyle: 'atx',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
      });

      const markdownContent = turndownService.turndown(content);
      const limitedContent = this.applyLengthLimits(markdownContent, validatedArgs.max_length, validatedArgs.start_index);

      return {
        content: [{ type: 'text', text: limitedContent }],
        isError: false,
      };
    } catch (error) {
      return this.createErrorResponse(error);
    }
  }

  /**
   * 统一的 HTTP 请求处理方法
   */
  private static async _fetch(args: RequestPayload): Promise<string> {
    const { url, headers } = args;

    // 安全检查：防止访问私有 IP
    if (this.isPrivateIP(url)) {
      throw new Error(`安全阻止：尝试访问私有 IP ${url}。这是为了防止安全漏洞，避免 MCP 服务器获取 privileged local IP 并泄露数据。`);
    }

    // 读取代理环境变量（支持 HTTP 和 HTTPS 代理）
    const proxyUrl = process.env.HTTPS_PROXY ||
                     process.env.https_proxy ||
                     process.env.HTTP_PROXY ||
                     process.env.http_proxy;

    // 构造 fetch 选项
    const fetchOptions: any = {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...headers,
      },
    };

    // 如果配置了代理，则添加 ProxyAgent
    if (proxyUrl) {
      try {
        // 验证代理 URL 格式
        new URL(proxyUrl);
        fetchOptions.dispatcher = new ProxyAgent(proxyUrl);
        console.error(`使用代理: ${proxyUrl.replace(/\/\/.*@/, '//***@')}`); // 隐藏认证信息
      } catch (error) {
        console.error(`代理 URL 格式无效: ${proxyUrl}`, error);
        throw new Error(`代理 URL 格式无效: ${proxyUrl}`);
      }
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP 错误：${response.status} ${response.statusText}`);
    }

    return await response.text();
  }

  /**
   * 验证输入参数
   */
  private static validateArgs(args: RequestPayload): RequestPayload {
    // 应用默认值和限制
    const validatedArgs = {
      ...args,
      max_length: Math.min(args.max_length || downloadLimit.default, downloadLimit.max),
      start_index: args.start_index || 0,
    };

    // 验证参数
    if (!validatedArgs.url) {
      throw new Error('URL 参数是必需的');
    }

    try {
      new URL(validatedArgs.url);
    } catch {
      throw new Error('无效的 URL 格式');
    }

    if (validatedArgs.start_index < 0) {
      throw new Error('start_index 必须大于等于 0');
    }

    if (validatedArgs.max_length < 0) {
      throw new Error('max_length 必须大于等于 0');
    }

    return validatedArgs;
  }

  /**
   * 应用内容长度限制
   */
  private static applyLengthLimits(text: string, maxLength: number, startIndex: number): string {
    if (startIndex >= text.length) {
      return '';
    }

    const end = maxLength > 0 ? Math.min(startIndex + maxLength, text.length) : text.length;
    return text.substring(startIndex, end);
  }

  /**
   * 检查 URL 是否指向私有 IP
   */
  private static isPrivateIP(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname;

      // 如果不是 IP 地址，则不是私有 IP
      if (!/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
        return false;
      }

      return !!isIPPrivate(hostname);
    } catch {
      return false;
    }
  }

  /**
   * 创建错误响应
   */
  private static createErrorResponse(error: unknown): ToolResponse {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    return {
      content: [{ type: 'text', text: errorMessage }],
      isError: true,
    };
  }
}