
import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { getSetting } from '@/lib/api';


export async function POST(req: NextRequest) {
  const panelUrl = await getSetting('panelUrl');

  if (!panelUrl) {
    return NextResponse.json({ message: 'Panel URL is not configured in the admin settings.' }, { status: 500 });
  }

  const targetUrl = `${panelUrl}/login`;

  try {
    const body = await req.json();

    const response = await axios.post(targetUrl, body, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        // Important to get the raw headers to extract set-cookie
        transformResponse: (data, headers) => ({ data, headers }),
        // Don't throw for non-2xx status codes
        validateStatus: () => true,
    });
    
    // Check if login was successful from 3x-ui panel
    if (response.status !== 200 || !response.data.data.success) {
        return NextResponse.json({ success: false, msg: response.data.data.msg || 'Login failed at panel' }, { status: response.status });
    }

    const setCookieHeader = response.data.headers['set-cookie'];
    const responseCookies = new NextResponse().cookies;

    if (setCookieHeader) {
      // Handle multiple set-cookie headers
      setCookieHeader.forEach((cookieString: string) => {
        const [cookiePair] = cookieString.split(';');
        const [cookieName, cookieValue] = cookiePair.split('=');
        if (cookieName === 'session') {
            responseCookies.set('session', cookieValue, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                path: '/',
                maxAge: 60 * 60 * 24 // 1 day
            });
        }
      });
    }

    // Return the original success response from the panel
    const finalResponse = NextResponse.json(response.data.data, { status: 200 });

    // Attach the prepared cookies to the final response
    // This makes the cookie available to subsequent requests made from the browser to our /api proxy
    finalResponse.headers.set('Set-Cookie', responseCookies.toString());

    return finalResponse;

  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    console.error(`API call failed for POST ${targetUrl}:`, error);
    return NextResponse.json({ message: 'An unknown error occurred during API proxying.' }, { status: 500 });
  }
}
