import "./App.css";
import { QueryClientProvider } from "./lib/QueryClientProvider";
import { QueryClient } from "./lib/QueryClient";
import { useQuery } from "./lib/useQuery";

interface IPlaceholder {
  id: string;
  title: string;
}

function Posts() {
  const { data, status, isFetching } = useQuery({
    queryKey: ["posts"],
    queryFn: () =>
      fetch("https://jsonplaceholder.typicode.com/posts").then((r) => r.json()),
  });
  if (status === "pending") return <p>로딩…</p>;
  if (status === "error") return <p>에러</p>;
  return (
    <ul>
      {isFetching && <span>갱신중</span>}
      {data.map((p: IPlaceholder) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Posts />
      <Posts /> {/* 같은 키를 쓰는 컴포넌트 2개 */}
    </QueryClientProvider>
  );
}

export default App;
