import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data, error } = await supabase
      .from('pest_monitoring')
      .select('*')
      .order('detected_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching pest monitoring data:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    
    // Validate required fields
    if (!body.threat_name || !body.threat_type || !body.status || !body.plot_id) {
      return NextResponse.json(
        { error: "Missing required fields: threat_name, threat_type, status, plot_id" }, 
        { status: 400 }
      );
    }
    
    // Insert into the database (don't specify ID as it's auto-generated)
    const { data, error } = await supabase
      .from('pest_monitoring')
      .insert([{
        threat_name: body.threat_name,
        threat_type: body.threat_type,
        status: body.status,
        description: body.description || null,
        photo_url: body.photo_url || body.image_url || null, // Support both field names
        scientific_name: body.scientific_name || null, // Include scientific name if available
        plot_id: body.plot_id,
        detected_at: body.detected_at || new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      console.error("Error inserting pest monitoring data:", error);
      // Return more detailed error response
      return NextResponse.json(
        { 
          error: error.message || "Internal server error",
          details: error 
        }, 
        { 
          status: error.code === '23505' ? 409 : 500 // 409 for unique violation
        }
      );
    }
    
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Unexpected error in POST:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: errorMessage
      }, 
      { status: 500 }
    );
  }
}