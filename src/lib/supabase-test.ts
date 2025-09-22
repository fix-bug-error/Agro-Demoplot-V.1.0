import { supabase } from "./supabase";

// Test Supabase connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('farmers')
      .select('count()', { count: 'exact', head: true });

    if (error) {
      console.error("Supabase connection error:", error);
      return { success: false, error: error.message };
    }

    console.log("Supabase connection successful");
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}