import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET /api/messages/:id - Get a single message
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id;

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching message:', messageId);

    const { data: message, error: messageError } = await supabase
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
      .eq('id', messageId)
      .single();

    if (messageError) {
      if (messageError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Message not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching message:', messageError);
      return NextResponse.json(
        { success: false, error: 'Error fetching message' },
        { status: 500 }
      );
    }

    console.log('Message fetched successfully');
    return NextResponse.json({ 
      success: true, 
      data: message 
    });

  } catch (err) {
    console.error('Error in GET /api/messages/:id:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}

// DELETE /api/messages/:id - Delete a message (soft delete optional)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id;
    const url = new URL(req.url);
    const softDelete = url.searchParams.get('soft') === 'true';

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Message ID is required' },
        { status: 400 }
      );
    }

    console.log('Deleting message:', messageId, softDelete ? '(soft delete)' : '(hard delete)');

    // First check if message exists
    const { error: checkError } = await supabase
      .from('messages')
      .select('id')
      .eq('id', messageId)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Message not found' },
          { status: 404 }
        );
      }
      console.error('Error checking message:', checkError);
      return NextResponse.json(
        { success: false, error: 'Error checking message' },
        { status: 500 }
      );
    }

    if (softDelete) {
      // Soft delete - update content to indicate deletion
      const { error: updateError } = await supabase
        .from('messages')
        .update({ 
          content: '[This message was deleted]',
          message_type: 'text'
        })
        .eq('id', messageId);

      if (updateError) {
        console.error('Error soft deleting message:', updateError);
        return NextResponse.json(
          { success: false, error: 'Error deleting message' },
          { status: 500 }
        );
      }

      console.log('Message soft deleted successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Message deleted successfully'
      });
    } else {
      // Hard delete - first delete attachments, then message
      const { error: attachmentError } = await supabase
        .from('message_attachments')
        .delete()
        .eq('message_id', messageId);

      if (attachmentError) {
        console.error('Error deleting message attachments:', attachmentError);
        return NextResponse.json(
          { success: false, error: 'Error deleting message attachments' },
          { status: 500 }
        );
      }

      const { error: messageError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (messageError) {
        console.error('Error deleting message:', messageError);
        return NextResponse.json(
          { success: false, error: 'Error deleting message' },
          { status: 500 }
        );
      }

      console.log('Message hard deleted successfully');
      return NextResponse.json({ 
        success: true, 
        message: 'Message deleted successfully'
      });
    }

  } catch (err) {
    console.error('Error in DELETE /api/messages/:id:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
} 