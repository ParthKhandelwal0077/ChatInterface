import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET /api/conversations/:id - Get details of a specific conversation
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      );
    }

    console.log('Fetching conversation details for:', conversationId);

    // First, get all phone numbers for this user to verify access
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
      return NextResponse.json(
        { success: false, error: 'User has no phone numbers' },
        { status: 404 }
      );
    }

    const phoneNumberIds = userPhoneNumbers.map(p => p.id);

    // Get conversation details with participant info
    const { data: conversation, error: conversationError } = await supabase
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
      .eq('id', conversationId)
      .single();

    if (conversationError) {
      console.error('Error fetching conversation:', conversationError);
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this conversation
    const hasAccess = phoneNumberIds.includes(conversation.participant_1) || 
                     phoneNumberIds.includes(conversation.participant_2);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this conversation' },
        { status: 403 }
      );
    }

    // Get messages for this conversation
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender_phone:phone_numbers!messages_sender_id_fkey(
          id,
          phone_number,
          user_id,
          users(name, email)
        ),
        reply_to_message:messages!messages_reply_to_message_id_fkey(
          id,
          content,
          message_type
        ),
        attachments:message_attachments(*)
      `)
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { success: false, error: 'Error fetching messages' },
        { status: 500 }
      );
    }

    const conversationDetails = {
      ...conversation,
      messages: messages || []
    };

    console.log('Conversation details fetched successfully');
    return NextResponse.json({ 
      success: true, 
      data: conversationDetails 
    });

  } catch (err) {
    console.error('Error in GET /api/conversations/:id:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/:id - Delete conversation (soft-delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 401 }
      );
    }

    console.log('Deleting conversation:', conversationId);

    // First, get all phone numbers for this user to verify access
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
      return NextResponse.json(
        { success: false, error: 'User has no phone numbers' },
        { status: 404 }
      );
    }

    const phoneNumberIds = userPhoneNumbers.map(p => p.id);

    // Check if conversation exists and user has access
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id, participant_1, participant_2')
      .eq('id', conversationId)
      .single();

    if (conversationError) {
      console.error('Error fetching conversation:', conversationError);
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this conversation
    const hasAccess = phoneNumberIds.includes(conversation.participant_1) || 
                     phoneNumberIds.includes(conversation.participant_2);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this conversation' },
        { status: 403 }
      );
    }

    // For now, we'll do a hard delete. You could add a 'deleted_at' column for soft delete
    // First delete all messages in the conversation
    const { error: messagesDeleteError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesDeleteError) {
      console.error('Error deleting messages:', messagesDeleteError);
      return NextResponse.json(
        { success: false, error: 'Error deleting conversation messages' },
        { status: 500 }
      );
    }

    // Then delete the conversation
    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) {
      console.error('Error deleting conversation:', deleteError);
      throw deleteError;
    }

    console.log('Conversation deleted successfully');
    return NextResponse.json({ 
      success: true, 
      message: 'Conversation deleted successfully' 
    });

  } catch (err) {
    console.error('Error in DELETE /api/conversations/:id:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
} 