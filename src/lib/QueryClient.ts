import { QueryCache } from "./QueryCache";
import { hashKey, type QueryKey } from "./utils";

export class QueryClient {
  private queryCache: QueryCache;

  constructor() {
    this.queryCache = new QueryCache();
  }

  getQueryCache(): QueryCache {
    return this.queryCache;
  }

  getQueryData<T = unknown>(queryKey: QueryKey): T | undefined {
    const queryHash = hashKey(queryKey);
    return this.queryCache.get<T>(queryHash)?.state.data;
  }
}
