import { describe, expect, it, vi } from "vitest";
import { QueryClient } from "./lib/QueryClient";
import { QueryObserver } from "./lib/QueryObserver";

describe("playground scenario", () => {
  it("subscribe 시 자동으로 fetch가 실행되고 성공 상태로 알림이 온다", async () => {
    vi.useFakeTimers();

    const client = new QueryClient();
    const queryFn = vi.fn(async () => {
      await new Promise((r) => setTimeout(r, 300));
      return [{ id: 1, title: "hello" }];
    });

    const observer = new QueryObserver(client, {
      queryKey: ["posts"],
      queryFn,
    });

    const listener = vi.fn();
    const unsubscribe = observer.subscribe(listener);

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(observer.getResult().status).toBe("pending");
    expect(observer.getResult().isFetching).toBe(true);

    await vi.advanceTimersByTimeAsync(300);

    const result = observer.getResult();
    expect(result.status).toBe("success");
    expect(result.isFetching).toBe(false);
    expect(result.data).toEqual([{ id: 1, title: "hello" }]);
    expect(listener).toHaveBeenCalled();

    unsubscribe();
    vi.useRealTimers();
  });

  it("queryFn이 실패하면 error 상태로 알림이 온다", async () => {
    const client = new QueryClient();
    const error = new Error("fetch failed");
    const queryFn = vi.fn(async () => {
      throw error;
    });

    const observer = new QueryObserver(client, {
      queryKey: ["posts", "error"],
      queryFn,
    });

    const listener = vi.fn();
    observer.subscribe(listener);

    await vi.waitFor(() => {
      expect(observer.getResult().status).toBe("error");
    });

    const result = observer.getResult();
    expect(result.error).toBe(error);
    expect(result.isFetching).toBe(false);
  });

  it("동일한 queryKey로 만든 observer는 같은 Query 인스턴스를 공유해 queryFn이 한 번만 호출된다", async () => {
    const client = new QueryClient();
    const queryFn = vi.fn(async () => "data");

    const observer1 = new QueryObserver(client, {
      queryKey: ["shared"],
      queryFn,
    });
    const observer2 = new QueryObserver(client, {
      queryKey: ["shared"],
      queryFn,
    });

    observer1.subscribe(vi.fn());
    observer2.subscribe(vi.fn());

    await vi.waitFor(() => {
      expect(observer1.getResult().status).toBe("success");
    });

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(observer2.getResult().data).toBe("data");
  });
});
