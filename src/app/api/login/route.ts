// This API route is no longer needed as direct panel communication is removed.
// You can safely delete this file.
import { NextResponse } from 'next/server';

export async function POST() {
    return NextResponse.json({ message: 'This API endpoint is deprecated.' }, { status: 410 });
}
