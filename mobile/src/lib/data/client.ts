import type { DataProvider } from "@/lib/data/provider";
import { SportsApiProvider } from "@/lib/data/sportsApiProvider";

let instance: DataProvider | null = null;
export function getProvider(): DataProvider {
  if (!instance) instance = new SportsApiProvider();
  return instance;
}
