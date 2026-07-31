import { hashKey, type QueryKey } from "./utils";
import { Query } from "./Query";

export class QueryCache {
  private queries = new Map<string, Query<unknown>>();

  build<T>(options: {
    queryKey: QueryKey;
    queryFn: () => Promise<T>;
  }): Query<T> {
    const queryHash = hashKey(options.queryKey);
    const existing = this.queries.get(queryHash);
    if (existing) return existing as unknown as Query<T>;

    const query = new Query<T>({
      queryKey: options.queryKey,
      queryHash,
      queryFn: options.queryFn,
    });
    this.queries.set(queryHash, query as unknown as Query<unknown>);
    return query;
  }

  get<T = unknown>(queryHash: string): Query<T> | undefined {
    return this.queries.get(queryHash) as unknown as Query<T> | undefined;
  }

  getAll(): Query<unknown>[] {
    return Array.from(this.queries.values());
  }
}
