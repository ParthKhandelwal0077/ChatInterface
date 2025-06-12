import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// PUT /api/phone-numbers/:id - Edit phone number (update is_primary status)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { isPrimary, userId } = await req.json();
    
    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      );
    }

    if (isPrimary === undefined) {
      return NextResponse.json(
        { success: false, error: 'isPrimary field is required' },
        { status: 400 }
      );
    }

    console.log('Updating phone number:', id);

    // Verify phone number exists and belongs to the user
    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (phoneError || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number not found or access denied' },
        { status: 404 }
      );
    }

    // If setting as primary, unset other primary numbers for this user
    if (isPrimary) {
      const { error: updateError } = await supabase
        .from('phone_numbers')
        .update({ is_primary: false })
        .eq('user_id', userId)
        .eq('is_primary', true)
        .neq('id', id); // Don't update the current phone number

      if (updateError) {
        console.error('Error updating existing primary numbers:', updateError);
        // Don't fail the request for this, just log the error
      }
    }

    // Update the phone number
    const { data: updatedPhoneNumber, error: updateError } = await supabase
      .from('phone_numbers')
      .update({ is_primary: isPrimary })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating phone number:', updateError);
      throw updateError;
    }

    console.log('Phone number updated successfully');
    return NextResponse.json({ 
      success: true, 
      data: updatedPhoneNumber 
    });

  } catch (err) {
    console.error('Error in PUT /api/phone-numbers/:id:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

// DELETE /api/phone-numbers/:id - Remove phone number
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get user ID from query parameters
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      );
    }

    console.log('Deleting phone number:', id);

    // Verify phone number exists and belongs to the user
    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (phoneError || !phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number not found or access denied' },
        { status: 404 }
      );
    }

    // Check if this is the user's only phone number
    const { data: userPhoneNumbers, error: countError } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('user_id', userId);

    if (countError) {
      console.error('Error counting phone numbers:', countError);
      throw countError;
    }

    if (userPhoneNumbers && userPhoneNumbers.length <= 1) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete the last phone number' },
        { status: 400 }
      );
    }

    // Delete the phone number
    const { error: deleteError } = await supabase
      .from('phone_numbers')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting phone number:', deleteError);
      throw deleteError;
    }

    // If the deleted number was primary, make another number primary
    if (phoneNumber.is_primary && userPhoneNumbers && userPhoneNumbers.length > 1) {
      const { error: setPrimaryError } = await supabase
        .from('phone_numbers')
        .update({ is_primary: true })
        .eq('user_id', userId)
        .limit(1);

      if (setPrimaryError) {
        console.error('Error setting new primary number:', setPrimaryError);
        // Don't fail the request for this, just log the error
      }
    }

    console.log('Phone number deleted successfully');
    return NextResponse.json({ 
      success: true,
      message: 'Phone number deleted successfully'
    });

  } catch (err) {
    console.error('Error in DELETE /api/phone-numbers/:id:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
} 