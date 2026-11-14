// The one place where the app talks to the backend.
export class ApiError extends Error {
  status: number;
  code: string;
  fields: Array<{ field: string; message: string }>;

  constructor(status: number, code: string, message: string, fields: Array<{ field: string; message: string }> = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

type Options = { method?: string; body?: unknown };

async function send(path: string, options: Options): Promise<Response> {
  try {
    return await fetch(path, {
      method: options.method ?? "GET",
      credentials: "same-origin",
      headers: options.body === undefined ? undefined : { "Content-Type": "application/json" },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, "NETWORK", "Could not reach the server.");
  }
}

let refreshing: Promise<boolean> | null = null;

// Asks the backend for a fresh login. Many calls at once share one request.
function refreshSession(): Promise<boolean> {
  if (!refreshing) {
    refreshing = send("/api/auth/refresh", { method: "POST" })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  let res = await send(path, options);

  // The short login token may have expired: refresh once and try again.
  if (res.status === 401 && !path.startsWith("/api/auth/")) {
    if (await refreshSession()) {
      res = await send(path, options);
    }
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const error = json?.error;
    throw new ApiError(
      res.status,
      typeof error?.code === "string" ? error.code : "SERVER_ERROR",
      typeof error?.message === "string" ? error.message : "Something went wrong.",
      Array.isArray(error?.fields) ? error.fields : []
    );
  }
  return json as T;
}