import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET /api/phone-numbers - List all phone numbers linked to user
export async function GET(req: NextRequest) {
  try {
    // Get user ID from query parameters
    // In a real app, you'd extract this from JWT token or session
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      );
    }

    console.log('Fetching phone numbers for user:', userId);

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's phone numbers
    const { data: phoneNumbers, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: true });

    if (phoneError) {
      console.error('Error fetching phone numbers:', phoneError);
      return NextResponse.json(
        { success: false, error: 'Error fetching phone numbers' },
        { status: 500 }
      );
    }

    console.log('Phone numbers fetched successfully');
    return NextResponse.json({ 
      success: true, 
      data: phoneNumbers || [] 
    });

  } catch (err) {
    console.error('Error in GET /api/phone-numbers:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

// POST /api/phone-numbers - Add a new phone number
export async function POST(req: NextRequest) {
  try {
    const { userId, phoneNumber, isPrimary = false } = await req.json();
    
    // Validate required fields
    if (!userId || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'User ID and phone number are required' },
        { status: 400 }
      );
    }

    // Validate phone number format (basic validation)
    const cleanPhoneNumber = phoneNumber.trim();
    if (cleanPhoneNumber.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Phone number cannot be empty' },
        { status: 400 }
      );
    }

    console.log('Adding phone number for user:', userId);

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if phone number already exists
    const { data: existingPhone } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('phone_number', cleanPhoneNumber)
      .single();

    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: 'Phone number already exists' },
        { status: 409 }
      );
    }

    // If this is set as primary, unset other primary numbers for this user
    if (isPrimary) {
      const { error: updateError } = await supabase
        .from('phone_numbers')
        .update({ is_primary: false })
        .eq('user_id', userId)
        .eq('is_primary', true);

      if (updateError) {
        console.error('Error updating existing primary numbers:', updateError);
        // Don't fail the request for this, just log the error
      }
    }

    // Insert new phone number
    const { data: newPhoneNumber, error: insertError } = await supabase
      .from('phone_numbers')
      .insert([{
        user_id: userId,
        phone_number: cleanPhoneNumber,
        is_primary: isPrimary
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting phone number:', insertError);
      throw insertError;
    }

    console.log('Phone number added successfully');
    return NextResponse.json({ 
      success: true, 
      data: newPhoneNumber 
    });

  } catch (err) {
    console.error('Error in POST /api/phone-numbers:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
} 