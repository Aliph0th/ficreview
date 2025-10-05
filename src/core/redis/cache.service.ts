import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class CacheService {
   constructor(private readonly redis: RedisService) {}

   async getJson<T>(key: string): Promise<T | null> {
      const val = await this.redis.get(key);
      if (!val) return null;
      try {
         return JSON.parse(val) as T;
      } catch {
         return null;
      }
   }

   async setJson(key: string, value: unknown, ttl?: number): Promise<void> {
      const s = JSON.stringify(value);
      if (ttl && ttl > 0) {
         await this.redis.set(key, s, 'EX', ttl);
      } else {
         await this.redis.set(key, s);
      }
   }

   async getOrSetJson<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T> {
      const cached = await this.getJson<T>(key);
      if (cached !== null) return cached;
      const data = await callback();
      await this.setJson(key, data, ttl);
      return data;
   }

   async getVersion(versionKey: string): Promise<number> {
      const v = await this.redis.get(versionKey);
      if (!v) {
         await this.redis.set(versionKey, '1');
         return 1;
      }
      return +v;
   }

   async incrVersion(...versionKeys: string[]): Promise<void> {
      await Promise.all(versionKeys.map(k => this.redis.incr(k)));
   }
}
