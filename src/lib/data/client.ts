import { MockProvider } from "@/lib/data/mock";
import type { DataProvider } from "@/lib/data/provider";

// Single shared instance for the session. Swap to a SupabaseProvider when
// NEXT_PUBLIC_SUPABASE_URL is set (post-MVP increment; schema in supabase/schema.sql).
let instance: DataProvider | null = null;
export function getProvider(): DataProvider {
  if (!instance) instance = new MockProvider();
  return instance;
}
