import { createSupabaseServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    const { id } = await params; // Await the params promise
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    
    // Validate required fields
    if (!body.threat_name || !body.threat_type || !body.status) {
      return NextResponse.json(
        { error: "Missing required fields: threat_name, threat_type, status" }, 
        { status: 400 }
      );
    }
    
    // Update the database record
    const { data, error } = await supabase
      .from('pest_monitoring')
      .update({
        threat_name: body.threat_name,
        threat_type: body.threat_type,
        status: body.status,
        description: body.description || null,
        photo_url: body.photo_url || body.image_url || null // Support both field names
      })
      .eq('id', Number(id))
      .select()
      .single();
    
    if (error) {
      console.error("Error updating pest monitoring data:", error);
      return NextResponse.json(
        { 
          error: error.message || "Internal server error",
          details: error 
        }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error in PUT:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient();
    const { id } = await params; // Await the params promise
    
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    
    // Delete the database record
    const { error } = await supabase
      .from('pest_monitoring')
      .delete()
      .eq('id', Number(id));
    
    if (error) {
      console.error("Error deleting pest monitoring data:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}