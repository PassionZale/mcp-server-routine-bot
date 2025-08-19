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
  duration?: number; // 内存缓存持续时间（毫秒）
  filePath?: string; // 缓存文件路径
  maxAge?: number; // 文件缓存最大存活时间（毫秒）
  autoSave?: boolean; // 是否自动保存
  enableLogging?: boolean; // 是否启用日志
}

type ConstructorConfig = Omit<CacheConfig, "filePath"> & { fileName?: string };

export class CacheManager<T = CacheItem> {
  private memoryCache: T[] = [];
  private cacheExpiry: number = 0;
  private readonly config: Required<CacheConfig>;
  private readonly filePath: string;

  constructor(options: ConstructorConfig = {}) {
    const { fileName = "cache.json", ...config } = options;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const filePath = join(__dirname, '../prompts', fileName);

    // 默认配置
    this.config = {
      duration: 5 * 60 * 1000, // 5分钟
      filePath,
      maxAge: 24 * 60 * 60 * 1000, // 24小时
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
    const now = Date.now();

    // 检查内存缓存是否有效
    if (this.memoryCache.length > 0 && now < this.cacheExpiry) {
      this.log("Using memory cache");
      return this.memoryCache;
    }

    this.log("Memory cache expired or empty");
    return this.memoryCache;
  }

  /**
   * 设置缓存数据
   */
  async set(data: T[], metadata?: Record<string, any>): Promise<void> {
    this.memoryCache = data;
    this.cacheExpiry = Date.now() + this.config.duration;

    this.log(`Cache updated with ${data.length} items`);

    if (this.config.autoSave) {
      await this.saveToFile(metadata);
    }
  }

  /**
   * 检查缓存是否有效
   */
  isValid(): boolean {
    return this.memoryCache.length > 0 && Date.now() < this.cacheExpiry;
  }

  /**
   * 强制刷新缓存（清除过期时间）
   */
  invalidate(): void {
    this.cacheExpiry = 0;
    this.log("Cache invalidated");
  }

  /**
   * 清除所有缓存
   */
  async clear(): Promise<void> {
    this.memoryCache = [];
    this.cacheExpiry = 0;

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
      // 检查文件是否存在及其年龄
      const stats = await fs.stat(this.filePath);
      const now = Date.now();
      const fileAge = now - stats.mtime.getTime();

      if (fileAge > this.config.maxAge) {
        this.log("Cache file is too old, skipping load");
        return false;
      }

      const data = await fs.readFile(this.filePath, "utf-8");
      const cacheData: CacheData<T> = JSON.parse(data);

      // 检查缓存是否还有效
      if (now < cacheData.timestamp + this.config.duration) {
        this.memoryCache = cacheData.data;
        this.cacheExpiry = cacheData.timestamp + this.config.duration;
        this.log(`Loaded ${this.memoryCache.length} items from cache file`);
        return true;
      } else {
        this.log("Cache file exists but expired");
        return false;
      }
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
      expiryTime: this.cacheExpiry,
      timeToExpiry: Math.max(0, this.cacheExpiry - Date.now()),
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
