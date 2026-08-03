import { useCallback, useState, useSyncExternalStore } from "react";
import { useQueryClient } from "./QueryClientProvider";
import type { QueryKey } from "./utils";
import { QueryObserver } from "./QueryObserver";

export function useQuery<T>(options: {
  queryKey: QueryKey;
  queryFn: () => Promise<T>;
}) {
  const client = useQueryClient();

  // 1) 컴포넌트 인스턴스당 Observer 하나 유지
  const [observer] = useState(() => new QueryObserver<T>(client, options));

  // 2) useSyncExternalStore로 구독
  useSyncExternalStore(
    useCallback(
      (onStoreChange) => observer.subscribe(onStoreChange),
      [observer],
    ),
    () => observer.getResult(), // ← 동일 참조 반환이 보장되어야 함!
  );

  // 3) 현재 결과 반환 (data, status, isFetching, error 등)
  return observer.getResult();
}
