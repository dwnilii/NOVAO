'use server';

import { cookies } from 'next/headers';
import type { User } from '@/lib/types';
import axios from 'axios';
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

// This action logs into the 3x-ui panel and stores the session cookie.
// It receives all required credentials as arguments from the client-side form.
export async function loginToPanel(panelUrl: string, username: string, password: string):Promise<{ success: boolean; message: string; }> {
   if (!panelUrl) {
    return { success: false, message: 'Panel URL is not configured.' };
  }

  const targetUrl = `${panelUrl}/login`;

  try {
    const response = await axios.post(targetUrl, { username, password }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        transformResponse: (data, headers) => ({ data, headers }),
        validateStatus: () => true, // Let us handle non-2xx responses
    });
    
    if (!response || !response.data) {
        return { success: false, message: 'Could not connect to the panel. Please check the URL.' };
    }

    if (response.status !== 200 || !response.data.data.success) {
        const errorMessage = response.data.data.msg || 'Panel login failed. Check panel credentials and URL.';
        return { success: false, message: errorMessage };
    }

    // If successful, find the 'session' cookie and set it for our domain.
    const setCookieHeader = response.data.headers['set-cookie'];
    if (setCookieHeader) {
      const sessionCookie = setCookieHeader.find((cookie: string) => cookie.startsWith('session='));
      if (sessionCookie) {
        const [cookiePair] = sessionCookie.split(';');
        const [cookieName, cookieValue] = cookiePair.split('=');
        cookies().set(cookieName, cookieValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            path: '/', // Make it available for the /api proxy
            maxAge: 60 * 60 * 24 // 1 day
        });

        // Also save the panel URL to the database settings
        await updateSetting('panelUrl', panelUrl);
        
        return { success: true, message: 'Successfully logged into panel and saved session.' };
      }
    }
    
    return { success: false, message: 'Panel did not return a session cookie.' };

  } catch (error) {
    console.error('Error during panel login process:', error);
    return { success: false, message: 'An unexpected error occurred during panel authentication.' };
  }
}


export async function logoutAdmin() {
  const cookieStore = cookies();
  // Clear both the portal session and the panel session cookies
  cookieStore.delete('novao-admin-session');
  cookieStore.delete('session');
  // Also clear the client-side user object
  cookieStore.delete('novao-user'); 
}
