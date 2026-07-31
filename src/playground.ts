import { QueryClient } from "./lib/QueryClient";
import { QueryObserver } from "./lib/QueryObserver";

const client = new QueryClient();

const observer = new QueryObserver(client, {
  queryKey: ["posts"],
  queryFn: async () => {
    console.log("🌐 실제 fetch 실행!");
    await new Promise((r) => setTimeout(r, 300));
    return [{ id: 1, title: "hello" }];
  },
});

observer.subscribe(() => {
  console.log("🔔 알림:", observer.getResult());
});
