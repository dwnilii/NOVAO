// This API route is no longer needed as direct panel communication via a proxy is removed.
// You can safely delete this file.
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: 'This API endpoint is deprecated.' }, { status: 410 });
}
export async function POST() {
    return NextResponse.json({ message: 'This API endpoint is deprecated.' }, { status: 410 });
}
export async function PUT() {
    return NextResponse.json({ message: 'This API endpoint is deprecated.' }, { status: 410 });
}
export async function DELETE() {
    return NextResponse.json({ message: 'This API endpoint is deprecated.' }, { status: 410 });
}
