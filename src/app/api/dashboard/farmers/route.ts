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

export async function GET() {
  try {
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

    // Use service role to fetch farmers linked to this user
    const supabase = await createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get farmer IDs linked to this user
    const { data: userFarmersData, error: userFarmersError } = await supabase
      .from('user_farmers')
      .select('farmer_id')
      .eq('user_id', userId);

    if (userFarmersError) {
      console.error('Error fetching user farmers:', userFarmersError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch user farmers: ${userFarmersError.message || JSON.stringify(userFarmersError)}`
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!userFarmersData || userFarmersData.length === 0) {
      // Return empty array if no farmers linked to user
      console.log('No farmers linked to user, returning empty array');
      return new Response(
        JSON.stringify({
          success: true,
          data: []
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract farmer IDs and fetch the farmer details
    const farmerIds = userFarmersData.map(uf => uf.farmer_id);

    const { data, error } = await supabase
      .from('farmers')
      .select('*')
      .in('id', farmerIds)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching farmers:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to fetch farmers: ${error.message || JSON.stringify(error)}`
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully fetched farmers, count:', data ? data.length : 0, 'data type:', typeof data);
    return new Response(
      JSON.stringify({
        success: true,
        data: Array.isArray(data) ? data : []
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in GET:', error);
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

export async function POST(request: Request) {
  try {
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

    // Parse the request body
    const body: Omit<Farmer, 'id' | 'created_at' | 'updated_at'> = await request.json();

    // Validate required fields
    if (!body.full_name) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Full name is required'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Attempting to insert farmer with data:', {
      full_name: body.full_name,
      gender: body.gender,
      phone_number: body.phone_number,
      address: body.address,
      farmer_group: body.farmer_group,
      photo_url: body.photo_url,
      national_id: body.national_id,
      education: body.education,
      date_of_birth: body.date_of_birth,
      profile: body.profile
    });

    // Insert the new farmer record using service role key (bypasses RLS)
    const { data: farmerData, error: farmerError } = await supabase
      .from('farmers')
      .insert([{
        full_name: body.full_name,
        gender: body.gender,
        phone_number: body.phone_number,
        address: body.address,
        farmer_group: body.farmer_group,
        photo_url: body.photo_url,
        national_id: body.national_id,
        education: body.education,
        date_of_birth: body.date_of_birth,
        profile: body.profile
      }])
      .select()
      .single();

    if (farmerError) {
      console.error('Error inserting farmer:', farmerError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to create farmer: ${farmerError.message || JSON.stringify(farmerError)}`
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Farmer created successfully with ID:', farmerData.id);
    console.log('Attempting to link farmer to user:', { userId, farmerId: farmerData.id });

    // First check if the relationship already exists
    const { data: existingRelationship, error: checkError } = await supabase
      .from('user_farmers')
      .select('*')
      .eq('user_id', userId)
      .eq('farmer_id', farmerData.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing relationship:', checkError);
      // Even if we can't check, we'll still try to create the relationship
    } else if (existingRelationship) {
      console.log('Relationship already exists, skipping creation');
    } else {
      console.log('No existing relationship found, creating new one');
      
      // Create the user-farmer relationship in the user_farmers table
      const { error: relationshipError } = await supabase
        .from('user_farmers')
        .insert([{
          user_id: userId, // Clerk user ID
          farmer_id: farmerData.id
        }]);

      // Handle duplicate key error (relationship already exists) as success
      if (relationshipError) {
        const isDuplicate = relationshipError.code === '23505' || 
          (relationshipError.message && relationshipError.message.includes('duplicate key'));
        
        if (isDuplicate) {
          console.log('Relationship already exists, treating as success');
        } else {
          console.error('Error creating user-farmer relationship:', relationshipError);
          console.error('User ID:', userId);
          console.error('Farmer ID:', farmerData.id);
          
          // Rollback: delete the farmer record we just created
          await supabase
            .from('farmers')
            .delete()
            .eq('id', farmerData.id);
          
          return new Response(
            JSON.stringify({
              success: false,
              error: `Failed to link farmer to user: ${relationshipError.message || JSON.stringify(relationshipError) || 'Unknown database error'}`
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      } else {
        console.log('Farmer successfully linked to user');
      }
    }

    // Return the newly created farmer data
    return new Response(
      JSON.stringify({
        success: true,
        data: farmerData
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error in POST:', error);
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