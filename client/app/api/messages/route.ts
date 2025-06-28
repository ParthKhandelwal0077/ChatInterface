import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

interface MessageData {
  conversationId?: string;
  groupId?: string;
  communityId?: string;
  senderId: string;
  content?: string;
  messageType?: string;
  replyToMessageId?: string;
  attachmentUrl?: string;
}

// GET /api/messages?conversationId=xyz&groupId=xyz&communityId=xyz
export async function GET(req: NextRequest) {
  try {
    const conversationId = req.nextUrl.searchParams.get('conversationId');
    const groupId = req.nextUrl.searchParams.get('groupId');
    const communityId = req.nextUrl.searchParams.get('communityId');

    // Validate that at least one context is provided
    if (!conversationId && !groupId && !communityId) {
      return NextResponse.json(
        { success: false, error: 'At least one of conversationId, groupId, or communityId is required' },
        { status: 400 }
      );
    }

    console.log('Fetching messages for:', { conversationId, groupId, communityId });

    // Build the query based on which ID is provided
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender_phone:phone_numbers!messages_sender_id_fkey(
          id,
          phone_number,
          users(name, email)
        ),
        reply_to_message:messages!messages_reply_to_message_id_fkey(
          id,
          content,
          message_type,
          sender_phone:phone_numbers!messages_sender_id_fkey(
            phone_number,
            users(name)
          )
        ),
        attachments:message_attachments(*)
      `)
      .order('sent_at', { ascending: true });

    if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    } else if (groupId) {
      query = query.eq('group_id', groupId);
    } else if (communityId) {
      query = query.eq('community_id', communityId);
    }

    const { data: messages, error: messagesError } = await query;

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { success: false, error: 'Error fetching messages' },
        { status: 500 }
      );
    }

    console.log('Messages fetched successfully');
    return NextResponse.json({ 
      success: true, 
      data: messages || [] 
    });

  } catch (err) {
    console.error('Error in GET /api/messages:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send a new message
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    
    // Only handle JSON requests
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { success: false, error: 'Content type must be application/json' },
        { status: 400 }
      );
    }

    const messageData: MessageData = await req.json();

    const { 
      conversationId, 
      groupId, 
      communityId, 
      senderId, // This is the user ID
      content, 
      messageType = 'text', 
      replyToMessageId,
      attachmentUrl
    } = messageData;

    // Validate required fields
    if (!senderId) {
      return NextResponse.json(
        { success: false, error: 'Sender ID is required' },
        { status: 400 }
      );
    }

    // Get the phone number ID for the sender
    const { data: senderPhone, error: senderError } = await supabase
      .from('phone_numbers')
      .select('id')
      .eq('user_id', senderId)
      .single();

    if (senderError || !senderPhone) {
      return NextResponse.json(
        { success: false, error: 'No phone number found for this user' },
        { status: 404 }
      );
    }

    // Validate that at least one context is provided
    if (!conversationId && !groupId && !communityId) {
      return NextResponse.json(
        { success: false, error: 'At least one of conversationId, groupId, or communityId is required' },
        { status: 400 }
      );
    }

    // Validate that exactly one context is provided
    const contextCount = [conversationId, groupId, communityId].filter(Boolean).length;
    if (contextCount > 1) {
      return NextResponse.json(
        { success: false, error: 'Only one of conversationId, groupId, or communityId should be provided' },
        { status: 400 }
      );
    }

    // Validate content or attachment URL is provided
    if (!content && !attachmentUrl) {
      return NextResponse.json(
        { success: false, error: 'Either content or attachmentUrl must be provided' },
        { status: 400 }
      );
    }

    console.log('Creating message for sender:', senderId);

   

    // Validate reply_to_message_id if provided
    if (replyToMessageId) {
      const { data: replyMessage, error: replyError } = await supabase
        .from('messages')
        .select('id')
        .eq('id', replyToMessageId)
        .single();

      if (replyError || !replyMessage) {
        return NextResponse.json(
          { success: false, error: 'Reply to message not found' },
          { status: 404 }
        );
      }
    }

    // Create the message
    const createMessageData = {
      conversation_id: conversationId || null,
      group_id: groupId || null,
      community_id: communityId || null,
      sender_id: senderPhone.id, // Use the phone number ID instead of user ID
      content: content || null,
      message_type: messageType,
      reply_to_message_id: replyToMessageId || null,
      sent_at: new Date().toISOString()
    };

    // First insert the message
    const { data: insertedMessage, error: insertError } = await supabase
      .from('messages')
      .insert([createMessageData])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating message:', insertError);
      return NextResponse.json(
        { success: false, error: 'Error creating message' },
        { status: 500 }
      );
    }

    // Then fetch the message with all its relations
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .select(`
        *,
        sender_phone:phone_numbers!messages_sender_id_fkey(
          id,
          phone_number,
          users(name, email)
        ),
        reply_to_message:messages!messages_reply_to_message_id_fkey(
          id,
          content,
          message_type,
          sender_phone:phone_numbers!messages_sender_id_fkey(
            phone_number,
            users(name)
          )
        )
      `)
      .eq('id', insertedMessage.id)
      .single();

    if (messageError) {
      console.error('Error fetching created message:', messageError);
      return NextResponse.json(
        { success: false, error: 'Error fetching created message' },
        { status: 500 }
      );
    }

    // Handle attachment if provided
    let messageAttachments = [];
    if (attachmentUrl) {
      const attachmentData = {
        message_id: newMessage.id,
        file_url: attachmentUrl,
        file_type: 'unknown', // You can enhance this to detect from URL or accept as parameter
        file_name: attachmentUrl.split('/').pop() || 'attachment',
        file_size: null,
        width: null,
        height: null,
        uploaded_at: new Date().toISOString()
      };

      const { data: createdAttachments, error: attachmentError } = await supabase
        .from('message_attachments')
        .insert([attachmentData])
        .select();

      if (attachmentError) {
        console.error('Error creating attachment:', attachmentError);
        // Don't fail the message creation, just log the error
        console.warn('Message created but attachment failed to save');
      } else {
        messageAttachments = createdAttachments;
      }
    }

    const responseMessage = {
      ...newMessage,
      attachments: messageAttachments
    };

    console.log('Message created successfully');
    return NextResponse.json({ 
      success: true, 
      data: responseMessage 
    });

  } catch (err) {
    console.error('Error in POST /api/messages:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
} 