import { createSupabaseServerClient } from "@/lib/supabase";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Extract search parameters from the URL
    const { searchParams } = new URL(req.url);
    const plotId = searchParams.get('plotId');
    const depth = searchParams.get('depth');
    
    let query = supabase
      .from('soilgrids_points')
      .select('*');

    // Filter by plotId if provided
    if (plotId) {
      query = query.eq('plot_id', plotId);
    }
    
    // Filter by depth if provided
    if (depth) {
      query = query.eq('depth', depth);
    }
    
    // Order by property and depth for consistent display
    query = query.order('property, depth');
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching soil data:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}