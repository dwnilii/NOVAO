import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pin } = body;

    // Securely compare the provided PIN with the one from environment variables on the server.
    const isCorrect = pin === process.env.ADMIN_PIN;

    if (isCorrect) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: 'Invalid PIN' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: 'An error occurred during PIN verification.' }, { status: 500 });
  }
}
