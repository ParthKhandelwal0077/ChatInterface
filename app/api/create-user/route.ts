import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function POST(req: NextRequest) {
  try {
    const { id, name, email, phoneNumbers } = await req.json();
    
    // Validate required fields
    if (!id || !name || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Received data:', { id, name, email, phoneNumbers });

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    // Insert user
    const { error: userError } = await supabase
      .from('users')
      .insert([{ id, name, email }]);
    
    console.log('User insert result:', { error: userError });
    if (userError) throw userError;

    // Insert phone numbers
    if (Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
      // Validate phone numbers
      const validPhoneNumbers = phoneNumbers.filter(phone => 
        phone.number && typeof phone.number === 'string' && phone.number.trim() !== ''
      );

      if (validPhoneNumbers.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No valid phone numbers provided' },
          { status: 400 }
        );
      }

      const phoneNumberInserts = validPhoneNumbers.map((phone: { number: string; isPrimary: boolean }) => ({
        user_id: id,
        phone_number: phone.number.trim(),
        is_primary: phone.isPrimary,
      }));

      const { error: phoneError } = await supabase
        .from('phone_numbers')
        .insert(phoneNumberInserts);
      
      console.log('Phone numbers insert result:', { error: phoneError });
      if (phoneError) throw phoneError;
    }

    console.log('Signup flow completed successfully');
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in signup flow:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
} 