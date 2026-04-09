import { createClient } from "@/lib/supabaseClient";
import type { DataConnection } from "@/types/database.types";

export async function fetchDataConnections(userId: string): Promise<DataConnection[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("data_connections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as DataConnection[];
}

export async function deleteDataConnection(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("data_connections").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Cập nhật danh sách ngân hàng đã bật cho một email kết nối.
 * Được gọi ngay khi người dùng Toggle một ngân hàng trên UI.
 */
export async function updateSelectedBanks(
  connectionId: string,
  selectedBanks: string[]
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("data_connections")
    .update({ selected_banks: selectedBanks, updated_at: new Date().toISOString() })
    .eq("id", connectionId);
  if (error) throw new Error(error.message);
}
