import { Query } from "./Query";
import type { QueryClient } from "./QueryClient";
import type { QueryKey } from "./utils";

interface QueryObserverOptions<T> {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
}

interface QueryObserverResult<T> {
  status: "pending" | "error" | "success";
  data: T | undefined;
  error: unknown;
  isFetching: boolean;
  dataUpdatedAt: number;
}

export class QueryObserver<T = unknown> {
  private query: Query<T>;
  private unsubscribeFromQuery: (() => void) | null = null;

  constructor(client: QueryClient, options: QueryObserverOptions<T>) {
    this.query = client.getQueryCache().build(options);
  }

  subscribe(listener: () => void): () => void {
    this.unsubscribeFromQuery = this.query.subscribe(listener);

    if (this.query.state.status === "pending" && !this.query.state.isFetching) {
      void this.query.fetch();
    }

    return () => {
      this.unsubscribeFromQuery?.();
      this.unsubscribeFromQuery = null;
    };
  }

  getResult(): QueryObserverResult<T> {
    const state = this.query.state;
    return {
      status: state.status,
      data: state.data,
      error: state.error,
      isFetching: state.isFetching,
      dataUpdatedAt: state.dataUpdatedAt,
    };
  }
}
