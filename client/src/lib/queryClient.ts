import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const message = await res.text().catch(() => "Unknown error");
    throw new Error(message);
  }
}

export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  body?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  
  await throwIfResNotOk(res);
  
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => (context: any) => Promise<T> = ({ on401 }: { on401: UnauthorizedBehavior }) => async ({
  queryKey,
}: any) => {
  const [url] = queryKey;
  const res = await fetch(url, {
    credentials: "include",
  });

  if (res.status === 401) {
    if (on401 === "returnNull") {
      return null;
    } else {
      throw new Error("Unauthorized");
    }
  }

  await throwIfResNotOk(res);

  return res.json();
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      retry: false,
    },
  },
});