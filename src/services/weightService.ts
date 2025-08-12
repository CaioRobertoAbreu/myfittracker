import { supabase } from "@/integrations/supabase/client";

export interface WeightEntry {
  id: string;
  user_id: string;
  weight: number;
  recorded_at: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export async function getWeightEntries() {
  const { data, error } = await supabase
    .from("weight_entries")
    .select("id,user_id,weight,recorded_at,created_at,updated_at")
    .order("recorded_at", { ascending: true });

  if (error) throw error;
  return (data || []) as WeightEntry[];
}

export async function addWeightEntry(weight: number, dateISO: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  const userId = userData.user?.id;
  if (!userId) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("weight_entries")
    .insert([
      {
        user_id: userId,
        weight,
        recorded_at: dateISO,
      },
    ])
    .select("id,user_id,weight,recorded_at,created_at,updated_at")
    .single();

  if (error) throw error;
  return data as WeightEntry;
}
