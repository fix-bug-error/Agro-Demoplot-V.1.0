import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import type { Plot } from "@/types";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Define proper types for the polygon data
    type PolygonData = {
      type: string;
      coordinates: number[][][]; // GeoJSON format
    };
    
    // Define proper types for the plots data
    type PlotWithPolygon = Plot & {
      polygon: PolygonData | null;
    };
    
    const { data, error }: { data: PlotWithPolygon[] | null; error: { message: string } | null } = await supabase
      .from('plots')
      .select(`
        *,
        polygon
      `)
      .order('plot_name', { ascending: true });
    
    if (error) {
      console.error("Error fetching plots:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Log polygon data for debugging
    console.log("Polygon data from Supabase:");
    if (data) {
      data.forEach((plot: PlotWithPolygon) => {
        console.log(`Plot ${plot.plot_name} (ID: ${plot.id}):`, JSON.stringify(plot.polygon, null, 2));
      });
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}