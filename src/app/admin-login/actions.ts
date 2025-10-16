'use server';

import { cookies } from 'next/headers';
import type { User } from '@/lib/types';
import { updateSetting } from '@/lib/api';

// This action ONLY handles the portal admin login based on .env variables.
// It sets a simple cookie to manage the admin's session in this portal.
export async function loginAdmin(username: string, pass: string): Promise<{ success: boolean; message: string; }> {
  const isAdmin = username === process.env.ADMIN_USERNAME && pass === process.env.ADMIN_PASSWORD;

  if (!isAdmin) {
    return { success: false, message: 'Invalid portal username or password.' };
  }

  // Set a cookie for the portal session
  cookies().set('novao-admin-session', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    path: '/',
    maxAge: 60 * 60 * 24 // 1 day
  });

  return { success: true, message: 'Admin login successful!' };
}

// This function is deprecated. Direct login to the panel is no longer supported.
export async function loginToPanel(panelUrl: string, username: string, password: string):Promise<{ success: boolean; message: string; }> {
   return { success: false, message: 'Direct panel login is no longer supported.' };
}


export async function logoutAdmin() {
  const cookieStore = cookies();
  // Clear both the portal session and the panel session cookies
  cookieStore.delete('novao-admin-session');
  cookieStore.delete('session'); // Keep this to clear old cookies
  // Also clear the client-side user object
  cookieStore.delete('novao-user'); 
}
