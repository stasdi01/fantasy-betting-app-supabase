import { supabase } from "./supabaseClient.ts";

export async function checkRateLimit(apiSource: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_api_rate_limit", {
    source: apiSource,
  });

  if (error) {
    console.error("Rate limit check error:", error);
    return false;
  }

  return data === true;
}

export async function incrementUsage(apiSource: string): Promise<void> {
  await supabase.rpc("increment_api_usage", {
    source: apiSource,
  });
}
