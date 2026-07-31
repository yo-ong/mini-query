import type { QueryKey } from "./utils";

type QueryStatus = "pending" | "error" | "success";

interface QueryState<T> {
  status: QueryStatus;
  data: T | undefined;
  error: unknown;
  isFetching: boolean;
  dataUpdatedAt: number;
}

export class Query<T = unknown> {
  queryKey: QueryKey;
  queryHash: string;
  state: QueryState<T>;
  private observers: Array<() => void> = [];
  private queryFn: () => Promise<T>;

  constructor(config: {
    queryKey: QueryKey;
    queryHash: string;
    queryFn: () => Promise<T>;
  }) {
    this.state = {
      status: "pending",
      data: undefined,
      error: undefined,
      isFetching: false,
      dataUpdatedAt: 0,
    };
    this.queryFn = config.queryFn;
    this.queryKey = config.queryKey;
    this.queryHash = config.queryHash;
  }

  subscribe(listener: () => void): () => void {
    this.observers.push(listener);
    return () =>
      (this.observers = this.observers.filter((v) => v !== listener));
  }

  private setState(updater: (prev: QueryState<T>) => QueryState<T>): void {
    this.state = updater({ ...this.state });
    this.notify();
  }

  private notify(): void {
    this.observers.forEach((fn) => fn());
  }

  async fetch(): Promise<T> {
    // 1) isFetching = true 로 setState
    this.setState((prev) => ({ ...prev, isFetching: true }));
    try {
      // 2) queryFn() 실행
      const data = await this.queryFn();
      // 3) 성공: status="success", data, dataUpdatedAt 갱신, isFetching=false
      this.setState((prev) => ({
        ...prev,
        status: "success",
        data,
        isFetching: false,
        dataUpdatedAt: Date.now(),
      }));
      return data;
    } catch (e) {
      // 4) 실패: status="error", error, isFetching=false
      // (dedup/레이스 컨디션은 Step 3에서 다루니 지금은 단순하게)
      this.setState((prev) => ({
        ...prev,
        isFetching: false,
        status: "error",
        error: e,
      }));
      throw e;
    }
  }
}
