import { Platform } from "react-native";

/** Resolve the API base URL, rewriting localhost for the Android emulator. */
export function apiBaseUrl(): string {
  let base = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";
  if (Platform.OS === "android") {
    base = base.replace("localhost", "10.0.2.2").replace("127.0.0.1", "10.0.2.2");
  }
  return base.replace(/\/$/, "");
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBaseUrl()}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || `${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};
