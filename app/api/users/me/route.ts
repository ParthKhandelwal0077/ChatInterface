import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { User } from '@/utils/supabaseType';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET /api/users/me - Get logged-in user's profile
export async function GET(req: NextRequest) {
  try {
    // Get user ID from query parameters or headers
    // In a real app, you'd extract this from JWT token or session
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      );
    }

    console.log('Fetching user profile for:', userId);

    // Debug: Let's first see what users exist in the database
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(5);
    
    console.log('All users in database (first 5):', allUsers);
    console.log('Error fetching all users:', allUsersError);

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
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
      .order('is_primary', { ascending: false });

    if (phoneError) {
      console.error('Error fetching phone numbers:', phoneError);
      return NextResponse.json(
        { success: false, error: 'Error fetching phone numbers' },
        { status: 500 }
      );
    }

    const userProfile = {
      ...userData,
      phoneNumbers: phoneNumbers || []
    };

    console.log('User profile fetched successfully');
    return NextResponse.json({ 
      success: true, 
      data: userProfile 
    });

  } catch (err) {
    console.error('Error in GET /api/users/me:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

// PUT /api/users/me - Update user profile
export async function PUT(req: NextRequest) {
  try {
    const { userId, name, email, phoneNumbers } = await req.json();
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      );
    }

    if (!name && !email && !phoneNumbers) {
      return NextResponse.json(
        { success: false, error: 'At least one field must be provided for update' },
        { status: 400 }
      );
    }

    console.log('Updating user profile for:', userId);

    // Check if user exists
    console.log('Checking if user exists with ID:', userId);
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    console.log('User check result:', { existingUser, checkError });

    if (checkError || !existingUser) {
      console.error('User not found - checkError:', checkError);
      console.error('User not found - existingUser:', existingUser);
      return NextResponse.json(
        { success: false, error: 'User not found', details: checkError?.message },
        { status: 404 }
      );
    }

    // Update user basic info if provided
    if (name || email) {
      const updateData: Partial<User> = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user:', updateError);
        throw updateError;
      }
    }

    // Update phone numbers if provided
    if (Array.isArray(phoneNumbers)) {
      // First, delete existing phone numbers
      const { error: deleteError } = await supabase
        .from('phone_numbers')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting old phone numbers:', deleteError);
        throw deleteError;
      }

      // Insert new phone numbers if any
      if (phoneNumbers.length > 0) {
        const validPhoneNumbers = phoneNumbers.filter(phone => 
          phone.number && typeof phone.number === 'string' && phone.number.trim() !== ''
        );

        if (validPhoneNumbers.length > 0) {
          const phoneNumberInserts = validPhoneNumbers.map((phone: { number: string; isPrimary: boolean }) => ({
            user_id: userId,
            phone_number: phone.number.trim(),
            is_primary: phone.isPrimary,
          }));

          const { error: insertError } = await supabase
            .from('phone_numbers')
            .insert(phoneNumberInserts);

          if (insertError) {
            console.error('Error inserting new phone numbers:', insertError);
            throw insertError;
          }
        }
      }
    }

    // Fetch updated user profile
    const { data: updatedUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated user:', fetchError);
      throw fetchError;
    }

    // Get updated phone numbers
    const { data: updatedPhoneNumbers, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (phoneError) {
      console.error('Error fetching updated phone numbers:', phoneError);
      throw phoneError;
    }

    const updatedProfile = {
      ...updatedUser,
      phoneNumbers: updatedPhoneNumbers || []
    };

    console.log('User profile updated successfully');
    return NextResponse.json({ 
      success: true, 
      data: updatedProfile 
    });

  } catch (err) {
    console.error('Error in PUT /api/users/me:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
} 