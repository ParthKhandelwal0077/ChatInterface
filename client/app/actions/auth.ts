'use server'

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  try {
    const supabase = await createClient();
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Sign in error:', signInError);
      return { error: signInError.message };
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) {
      console.error('No authenticated user found after login');
      return { error: 'Authentication failed' };
    }

    revalidatePath('/', 'layout');
    redirect('/chat');
  } catch (error) {
    // Only log as error if it's not a redirect
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      // This is expected behavior when redirect() is called
      throw error;
    }
    console.error('Login action error:', error);
    return { error: 'An unexpected error occurred' };
  }
}

export async function signupAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const phoneNumbersJson = formData.get('phoneNumbers') as string;

  if (!name || !email || !password) {
    return { error: 'Name, email, and password are required' };
  }

  let phoneNumbers;
  try {
    phoneNumbers = JSON.parse(phoneNumbersJson || '[]');
  } catch {
    return { error: 'Invalid phone numbers format' };
  }

  try {
    const supabase = await createClient();
    
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`,
        data: {
          name,
        },
      },
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      return { error: authError.message };
    }

    if (authData.user) {
      // Call API to create user data
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: authData.user.id,
          name,
          email,
          phoneNumbers,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        console.error('User creation error:', result.error);
        return { error: result.error || 'Failed to create user data' };
      }

      revalidatePath('/', 'layout');
      return { success: true, message: 'Sign up successful! Please check your email for confirmation.' };
    }

    return { error: 'Failed to create user account' };
  } catch (error) {
    console.error('Signup action error:', error);
    return { error: 'An unexpected error occurred' };
  }
} 