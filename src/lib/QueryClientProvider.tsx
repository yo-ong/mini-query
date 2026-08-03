import { createContext, useContext } from "react";
import { QueryClient } from "./QueryClient";

// lib/QueryClientProvider.tsx
const QueryClientContext = createContext<QueryClient | undefined>(undefined);

export function QueryClientProvider({
  client,
  children,
}: {
  client: QueryClient;
  children: React.ReactNode;
}) {
  // Context.Provider로 client 내려주기
  return (
    <QueryClientContext.Provider value={client}>
      {children}
    </QueryClientContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useQueryClient(): QueryClient {
  // Context에서 꺼내고, 없으면 에러 throw ("Provider로 감싸세요")
  const ctx = useContext(QueryClientContext);
  if (ctx === undefined) throw Error("Provider로 감싸세요");

  return ctx;
}
