import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET /api/conversations - List all conversations for current phone numbers
export async function GET(req: NextRequest) {
  try {
    // Get user ID from query parameters
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      );
    }

    console.log('Fetching conversations for user:', userId);

    // First, get all phone numbers for this user
    const { data: userPhoneNumbers, error: phoneError } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('user_id', userId);

    if (phoneError) {
      console.error('Error fetching user phone numbers:', phoneError);
      return NextResponse.json(
        { success: false, error: 'Error fetching user phone numbers' },
        { status: 500 }
      );
    }

    if (!userPhoneNumbers || userPhoneNumbers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [] 
      });
    }

    const phoneNumberIds = userPhoneNumbers.map(p => p.id);

    // Get all conversations where the user is either participant_1 or participant_2
    const { data: conversations, error: conversationError } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1_phone:phone_numbers!conversations_participant_1_fkey(
          id,
          phone_number,
          user_id,
          users(name, email)
        ),
        participant_2_phone:phone_numbers!conversations_participant_2_fkey(
          id,
          phone_number,
          user_id,
          users(name, email)
        )
      `)
      .or(`participant_1.in.(${phoneNumberIds.join(',')}),participant_2.in.(${phoneNumberIds.join(',')})`)
      .order('created_at', { ascending: false });

    if (conversationError) {
      console.error('Error fetching conversations:', conversationError);
      return NextResponse.json(
        { success: false, error: 'Error fetching conversations' },
        { status: 500 }
      );
    }

    // Get the latest message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      (conversations || []).map(async (conversation) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select(`
            content,
            message_type,
            sent_at,
            sender_phone:phone_numbers!messages_sender_id_fkey(
              phone_number,
              users(name)
            )
          `)
          .eq('conversation_id', conversation.id)
          .order('sent_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...conversation,
          lastMessage: lastMessage || null
        };
      })
    );

    console.log('Conversations fetched successfully');
    return NextResponse.json({ 
      success: true, 
      data: conversationsWithLastMessage 
    });

  } catch (err) {
    console.error('Error in GET /api/conversations:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Create new conversation (with a selected phone number)
export async function POST(req: NextRequest) {
  try {
    const { userId, myPhoneNumberId, otherPhoneNumber } = await req.json();
    
    // Validate required fields
    if (!userId || !myPhoneNumberId || !otherPhoneNumber) {
      return NextResponse.json(
        { success: false, error: 'User ID, phone number ID, and other phone number are required' },
        { status: 400 }
      );
    }

    console.log('Creating conversation for user:', userId);

    // Verify the user owns the selected phone number
    const { data: userPhone, error: userPhoneError } = await supabase
      .from('phone_numbers')
      .select('id, phone_number')
      .eq('id', myPhoneNumberId)
      .eq('user_id', userId)
      .single();

    if (userPhoneError || !userPhone) {
      return NextResponse.json(
        { success: false, error: 'Phone number not found or not owned by user' },
        { status: 404 }
      );
    }

    // Find or create the other phone number
    let otherPhone;
    const { data: otherPhoneData, error: otherPhoneError } = await supabase
      .from('phone_numbers')
      .select('id, phone_number')
      .eq('phone_number', otherPhoneNumber)
      .single();

    if (otherPhoneError && otherPhoneError.code === 'PGRST116') {
      // Phone number doesn't exist, create it without a user
      const { data: newPhone, error: createPhoneError } = await supabase
        .from('phone_numbers')
        .insert([{
          phone_number: otherPhoneNumber,
          user_id: null,
          is_primary: false
        }])
        .select()
        .single();

      if (createPhoneError) {
        console.error('Error creating other phone number:', createPhoneError);
        return NextResponse.json(
          { success: false, error: 'Error creating phone number' },
          { status: 500 }
        );
      }

      otherPhone = newPhone;
    } else if (otherPhoneError) {
      console.error('Error fetching other phone number:', otherPhoneError);
      return NextResponse.json(
        { success: false, error: 'Error validating other phone number' },
        { status: 500 }
      );
    } else {
      otherPhone = otherPhoneData;
    }

    if (!otherPhone) {
      return NextResponse.json(
        { success: false, error: 'Could not find or create other phone number' },
        { status: 500 }
      );
    }

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${myPhoneNumberId},participant_2.eq.${otherPhone.id}),and(participant_1.eq.${otherPhone.id},participant_2.eq.${myPhoneNumberId})`)
      .single();

    if (existingConversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation already exists' },
        { status: 409 }
      );
    }

    // Create new conversation
    const { data: newConversation, error: insertError } = await supabase
      .from('conversations')
      .insert([{
        participant_1: myPhoneNumberId,
        participant_2: otherPhone.id
      }])
      .select(`
        *,
        participant_1_phone:phone_numbers!conversations_participant_1_fkey(
          id,
          phone_number,
          user_id,
          users(name, email)
        ),
        participant_2_phone:phone_numbers!conversations_participant_2_fkey(
          id,
          phone_number,
          user_id,
          users(name, email)
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating conversation:', insertError);
      throw insertError;
    }

    console.log('Conversation created successfully');
    return NextResponse.json({ 
      success: true, 
      data: newConversation 
    });

  } catch (err) {
    console.error('Error in POST /api/conversations:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
} 