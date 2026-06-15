import { BackendProvider } from "@/lib/data/backendProvider";
import type { DataProvider } from "@/lib/data/provider";

let instance: DataProvider | null = null;
export function getProvider(): DataProvider {
  if (!instance) instance = new BackendProvider();
  return instance;
}
