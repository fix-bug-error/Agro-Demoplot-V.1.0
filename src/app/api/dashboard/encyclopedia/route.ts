import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Fetch data from the ensiklo_hpg table
    const { data, error } = await supabase
      .from('ensiklo_hpg')
      .select('*')
      .order('threat_name', { ascending: true });
    
    if (error) {
      console.error('Error fetching encyclopedia data:', error);
      return NextResponse.json({ error: 'Failed to fetch encyclopedia data' }, { status: 500 });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error in encyclopedia API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}