import { QueryClient } from "./lib/QueryClient.ts";
import { QueryObserver } from "./lib/QueryObserver.ts";

type Post = { id: number; title: string };

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function createQueryFn(counter: { count: number }) {
  return async (): Promise<Post[]> => {
    counter.count += 1;
    console.log("🌐 실제 fetch 실행!");
    await sleep(300);
    return [{ id: 1, title: "hello" }];
  };
}

async function singleObserverNotifyOrder() {
  console.log("\n=== 1. 단일 Observer 알림 순서 ===");

  const client = new QueryClient();
  const counter = { count: 0 };
  const observer = new QueryObserver(client, {
    queryKey: ["posts"],
    queryFn: createQueryFn(counter),
  });

  const unsubscribe = observer.subscribe(() => {
    console.log("🔔 알림:", observer.getResult());
  });

  await sleep(500);
  console.log("getQueryData(['posts']) =", client.getQueryData(["posts"]));
  unsubscribe();
}

async function twoObserversSameKey() {
  console.log("\n=== 2. 같은 키 Observer 2개 ===");

  const client = new QueryClient();
  const counter = { count: 0 };
  const queryFn = createQueryFn(counter);

  const a = new QueryObserver(client, { queryKey: ["posts"], queryFn });
  const b = new QueryObserver(client, { queryKey: ["posts"], queryFn });

  const unsubscribeA = a.subscribe(() => {
    const result = a.getResult();
    console.log("🔔 A:", result.status, "isFetching:", result.isFetching);
  });
  const unsubscribeB = b.subscribe(() => {
    const result = b.getResult();
    console.log("🔔 B:", result.status, "isFetching:", result.isFetching);
  });

  await sleep(500);

  console.log("cache.getAll().length =", client.getQueryCache().getAll().length, "(기대: 1)");
  console.log("queryFn 실행 횟수 =", counter.count, "(기대: 1, 현재 구현: ?)");
  console.log("→ 1이 아니라면 왜 그런지 메모해두세요. Step 3 dedup의 출발점입니다.");

  unsubscribeA();
  unsubscribeB();
}

async function unsubscribeStopsNotify() {
  console.log("\n=== 3. unsubscribe 후 알림 차단 ===");

  const client = new QueryClient();
  const counter = { count: 0 };
  const observer = new QueryObserver(client, {
    queryKey: ["posts"],
    queryFn: createQueryFn(counter),
  });

  let notified = 0;
  const unsubscribe = observer.subscribe(() => {
    notified += 1;
  });

  unsubscribe();
  notified = 0;

  await sleep(500);

  console.log("unsubscribe 이후 알림 횟수 =", notified, "(기대: 0)");
  console.log("state 자체는 갱신됨:", observer.getResult().status);
}

await singleObserverNotifyOrder();
await twoObserversSameKey();
await unsubscribeStopsNotify();
