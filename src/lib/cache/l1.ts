import { LRUCache } from "lru-cache";
import { formatBytes } from "../utils";

function debug(...args: unknown[]) {
  console.debug("L1Cache", ...args);
}

// @see https://isaacs.github.io/node-lru-cache/

type TKey = string;
type TValue = string;

class L1Cache {
  FIVE_MINUTES_MS = 5 * 60 * 1000;
  ONE_MINUTE_MS = 60 * 1000;

  private store: LRUCache<TKey, TValue> | null = null;

  private async getStore() {
    if (this.store === null) {
      const max = await this.getCacheSize();
      this.store = new LRUCache<TKey, TValue>({
        max,
      });
    }
    return this.store;
  }

  async set(key: TKey, value: TValue) {
    const store = await this.getStore();

    const ttl = Math.floor(
      this.FIVE_MINUTES_MS + this.ONE_MINUTE_MS * Math.random(),
    );

    store.set(key, value, { ttl });
  }

  async get(key: TKey) {
    const store = await this.getStore();

    return store.get(key);
  }

  private async getHeapSizeLimit() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      const v8 = await import("node:v8");
      const heapInfo = v8.getHeapStatistics();
      const { heap_size_limit: heapSizeLimit } = heapInfo;

      debug({ heapSizeLimit: formatBytes(heapSizeLimit) });

      return heapSizeLimit;
    }

    return null;
  }

  private async getCacheSize(): Promise<number> {
    const heapSizeLimit = await this.getHeapSizeLimit();

    let cacheSize = 1;

    if (heapSizeLimit) {
      const expectedValueSize = 32 * 1024; // 32 KB
      cacheSize = Math.floor((heapSizeLimit / expectedValueSize) * 0.8);
    }

    debug({ cacheSize });

    return cacheSize;
  }
}

export const cacheL1 = new L1Cache();
