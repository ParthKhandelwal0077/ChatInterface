import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// GET /api/attachments/:id - Get attachment metadata or URL
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attachmentId = params.id;

    if (!attachmentId) {
      return NextResponse.json(
        { success: false, error: 'Attachment ID is required' },
        { status: 400 }
      );
    }

    console.log('Fetching attachment:', attachmentId);

    const { data: attachment, error: attachmentError } = await supabase
      .from('message_attachments')
      .select(`
        *,
        message:messages(
          id,
          conversation_id,
          group_id,
          community_id,
          sender_id,
          sent_at
        )
      `)
      .eq('id', attachmentId)
      .single();

    if (attachmentError) {
      if (attachmentError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Attachment not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching attachment:', attachmentError);
      return NextResponse.json(
        { success: false, error: 'Error fetching attachment' },
        { status: 500 }
      );
    }

    console.log('Attachment fetched successfully');
    return NextResponse.json({ 
      success: true, 
      data: attachment 
    });

  } catch (err) {
    console.error('Error in GET /api/attachments/:id:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
} 