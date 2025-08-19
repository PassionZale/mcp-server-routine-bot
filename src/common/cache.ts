import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export interface CacheItem {
  [key: string]: any;
}

export interface CacheData<T = CacheItem> {
  data: T[];
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface CacheConfig {
  filePath?: string; // 缓存文件路径
  autoSave?: boolean; // 是否自动保存
  enableLogging?: boolean; // 是否启用日志
}

type ConstructorConfig = Omit<CacheConfig, "filePath"> & { fileName?: string };

export class CacheManager<T = CacheItem> {
  private memoryCache: T[] = [];
  private readonly config: Required<CacheConfig>;
  private readonly filePath: string;

  constructor(options: ConstructorConfig = {}) {
    const { fileName = "cache.json", ...config } = options;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = join(__dirname, "../prompts", fileName);

    // 默认配置
    this.config = {
      filePath,
      autoSave: true,
      enableLogging: true,
      ...config,
    };

    // 设置缓存文件路径
    this.filePath = filePath;

    this.log("CacheManager initialized with config:", this.config);
  }

  /**
   * 初始化缓存 - 从文件加载
   */
  async init(): Promise<void> {
    await this.loadFromFile();
  }

  /**
   * 获取缓存数据
   */
  async get(): Promise<T[]> {
    this.log("Using memory cache");
    return this.memoryCache;
  }

  /**
   * 设置缓存数据
   */
  async set(data: T[], metadata?: Record<string, any>): Promise<void> {
    this.memoryCache = data;
    this.log(`Cache updated with ${data.length} items`);

    if (this.config.autoSave) {
      await this.saveToFile(metadata);
    }
  }

  /**
   * 检查缓存是否有效
   */
  isValid(): boolean {
    return this.memoryCache.length > 0;
  }

  /**
   * 清除所有缓存
   */
  async clear(): Promise<void> {
    this.memoryCache = [];

    try {
      await fs.unlink(this.filePath);
      this.log("Cache file cleared successfully");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        this.log("Error clearing cache file:", error);
      }
    }
  }

  /**
   * 手动保存到文件
   */
  async saveToFile(metadata?: Record<string, any>): Promise<void> {
    try {
      const cacheData: CacheData<T> = {
        data: this.memoryCache,
        timestamp: Date.now(),
        metadata,
      };

      await fs.writeFile(this.filePath, JSON.stringify(cacheData, null, 2));
      this.log("Cache saved to file successfully");
    } catch (error) {
      this.log("Error saving cache to file:", error);
      throw error;
    }
  }

  /**
   * 从文件加载缓存
   */
  async loadFromFile(): Promise<boolean> {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      const cacheData: CacheData<T> = JSON.parse(data);
      this.memoryCache = cacheData.data;
      this.log(`Loaded ${this.memoryCache.length} items from cache file`);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        this.log("Error loading cache file:", error);
      }
      return false;
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      itemCount: this.memoryCache.length,
      isValid: this.isValid(),
      filePath: this.filePath,
    };
  }

  /**
   * 日志输出
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.error(`[CacheManager] ${message}`, ...args);
    }
  }
}
