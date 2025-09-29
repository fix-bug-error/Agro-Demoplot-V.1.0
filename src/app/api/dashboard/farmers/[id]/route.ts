import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

// Supabase client initialization
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Farmer type definition
type Farmer = {
  id: number;
  full_name: string;
  gender: string | null;
  phone_number: string | null;
  address: string | null;
  farmer_group: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
  national_id: string | null;
  education: string | null;
  date_of_birth: string | null;
  profile: string | null;
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body: Partial<Farmer> = await request.json();

    if (!id || isNaN(Number(id))) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Valid farmer ID is required'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the authenticated user's ID from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required'
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if this user has permission to edit this farmer by checking user_farmers table
    const { data: userFarmerData, error: relationshipError } = await supabase
      .from('user_farmers')
      .select('farmer_id')
      .eq('user_id', userId)
      .eq('farmer_id', Number(id))
      .single();

    if (relationshipError || !userFarmerData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User does not have permission to edit this farmer'
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build update object excluding id, created_at, updated_at
    const updateObj: Partial<Farmer> = { ...body };
    delete updateObj.id;
    delete updateObj.created_at;
    delete updateObj.updated_at;

    const { data, error } = await supabase
      .from('farmers')
      .update(updateObj)
      .eq('id', Number(id))
      .select()
      .single();

    if (error) {
      console.error('Error updating farmer:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in PUT:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id || isNaN(Number(id))) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Valid farmer ID is required'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the authenticated user's ID from Clerk
    const { userId } = await auth();
    
    if (!userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Authentication required'
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if this user has permission to delete this farmer by checking user_farmers table
    const { data: userFarmerData, error: relationshipError } = await supabase
      .from('user_farmers')
      .select('farmer_id')
      .eq('user_id', userId)
      .eq('farmer_id', Number(id))
      .single();

    if (relationshipError || !userFarmerData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User does not have permission to delete this farmer'
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await supabase
      .from('farmers')
      .delete()
      .eq('id', Number(id));

    if (error) {
      console.error('Error deleting farmer:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: error.message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in DELETE:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}