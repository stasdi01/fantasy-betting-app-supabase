import { supabase } from "./supabaseClient.ts";

export interface SyncLog {
  api_source: string;
  sync_type: string;
  status: "success" | "error" | "partial";
  records_synced?: number;
  error_message?: string;
  execution_time_ms?: number;
}

export async function logSync(log: SyncLog): Promise<void> {
  const { error } = await supabase.from("api_sync_logs").insert([log]);

  if (error) {
    console.error("Failed to log sync:", error);
  }
}

export function createLogger(apiSource: string, syncType: string) {
  const startTime = Date.now();

  return {
    success: async (recordsSynced: number) => {
      await logSync({
        api_source: apiSource,
        sync_type: syncType,
        status: "success",
        records_synced: recordsSynced,
        execution_time_ms: Date.now() - startTime,
      });
    },
    error: async (errorMessage: string, recordsSynced?: number) => {
      await logSync({
        api_source: apiSource,
        sync_type: syncType,
        status: "error",
        records_synced: recordsSynced || 0,
        error_message: errorMessage,
        execution_time_ms: Date.now() - startTime,
      });
    },
  };
}
