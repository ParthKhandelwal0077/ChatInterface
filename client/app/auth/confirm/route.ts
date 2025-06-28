import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/chat'

  if (token_hash && type) {
    const supabase = await createClient()
    
    // Clean up the type parameter (remove any trailing characters like periods)
    const cleanType = type.replace(/[^a-zA-Z]/g, '')
    
    // For email confirmations, always use verifyOtp regardless of token format
    const { error } = await supabase.auth.verifyOtp({
      type: cleanType as EmailOtpType,
      token_hash,
    })

    if (!error) {
      // Verify that we have an authenticated user after verification
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Create user record in custom users table after confirmation
        try {
          const response = await fetch(`${origin}/api/create-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              email: user.email,
              phoneNumbers: user.user_metadata?.phoneNumbers || [],
            }),
          });

          const result = await response.json();
          if (!result.success) {
            console.error('User creation after confirmation failed:', result.error);
            // Continue anyway since auth user is confirmed
          }
        } catch (createError) {
          console.error('Error creating user after confirmation:', createError);
          // Continue anyway since auth user is confirmed
        }

        return NextResponse.redirect(`${origin}${next}`)
      } else {
        return NextResponse.redirect(`${origin}/auth/auth-code-error`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
} 