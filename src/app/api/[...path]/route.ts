import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { getSetting } from '@/lib/api';


// Base path for the 3x-ui panel API
const basePath = '/panel/api/inbounds';


async function proxyRequest(req: NextRequest, method: 'GET' | 'POST' | 'PUT' | 'DELETE') {
  const panelUrl = await getSetting('panelUrl');

  if (!panelUrl) {
    return NextResponse.json({ message: 'Panel URL is not configured in settings.' }, { status: 500 });
  }

  // Extract the path from the request, removing the '/api' prefix.
  const rawPath = req.nextUrl.pathname.replace('/api', '');

  // Get the session cookie that was set by our own /api/login endpoint.
  const sessionCookie = cookies().get('session');
  
  // All panel API calls (except login) require a session.
  if (!sessionCookie) {
      return NextResponse.json({ message: 'Authentication required. No session found.' }, { status: 401 });
  }
  
  let finalPath: string;

  // Specific mapping for getClientTraffics.
  // The frontend calls `/api/client/some_uuid`. We map it to the correct panel endpoint.
  if (rawPath.startsWith('/client/')) {
    const identifier = rawPath.split('/')[2];
    // This will hit `/panel/api/inbounds/getClientTrafficsById/some_uuid` on the 3x-ui panel
    finalPath = `${basePath}/getClientTrafficsById/${identifier}`;
  } else {
    // This handles other potential API calls if needed in the future.
    finalPath = `${basePath}${rawPath}`;
  }
  
  const targetUrl = `${panelUrl}${finalPath}`;

  try {
    const body = (method === 'POST' || method === 'PUT') && req.headers.get('content-type')?.includes('application/json') ? await req.json() : undefined;
    
    const response = await axios({
      method,
      url: targetUrl,
      data: body,
      headers: {
        // Forward essential headers
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Crucially, include the session cookie to authenticate with the panel
        'Cookie': `session=${sessionCookie.value}`
      },
      // Forward any query parameters from the original request
      params: req.nextUrl.searchParams,
    });

    return new NextResponse(JSON.stringify(response.data), {
      status: response.status,
      headers: { 
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      // Log the actual error from the panel for easier debugging
      console.error(`Error from panel API: ${error.response.status}`, error.response.data);
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    console.error(`API call failed for ${method} ${targetUrl}:`, error);
    return NextResponse.json({ message: 'An unknown error occurred during API proxying.' }, { status: 500 });
  }
}

// Export handlers for different HTTP methods
export async function POST(req: NextRequest) {
  return proxyRequest(req, 'POST');
}

export async function GET(req: NextRequest) {
  return proxyRequest(req, 'GET');
}

export async function PUT(req: NextRequest) {
  return proxyRequest(req, 'PUT');
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, 'DELETE');
}
