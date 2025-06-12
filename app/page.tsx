import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = createClientComponentClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('[Home Page] Session:', session);

  if (session) {
    console.log('[Home Page] Redirecting to /chat');
    redirect('/chat');
  } else {
    console.log('[Home Page] Redirecting to /login');
    redirect('/login');
  }
}
