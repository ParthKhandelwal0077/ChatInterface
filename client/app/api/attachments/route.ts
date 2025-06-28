import { NextResponse } from 'next/server';

// Note: File uploads should be done through /api/messages
// This base route just provides helpful error messages

export async function GET() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Use /api/attachments/:id to get individual attachment details',
      usage: {
        'Get attachment': 'GET /api/attachments/:id',
        'Upload files': 'POST /api/messages (with FormData containing files)'
      }
    },
    { status: 400 }
  );
}

export async function POST() {
  return NextResponse.json(
    { 
      success: false, 
      error: 'Use /api/messages to send messages with attachments',
      usage: {
        'Send message with files': 'POST /api/messages (with FormData)',
        'Send text message': 'POST /api/messages (with JSON)'
      }
    },
    { status: 400 }
  );
} 