import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { path: fontPath } = await request.json();
    
    if (!fontPath) {
      return NextResponse.json(
        { error: 'Font path is required' },
        { status: 400 }
      );
    }

    // Extract filename from path and create full path
    const fileName = fontPath.split('/').pop();
    const fullPath = path.join(process.cwd(), 'public', 'fonts', fileName);
    
    // Delete the font file
    await unlink(fullPath);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting font:', error);
    return NextResponse.json(
      { error: 'Error deleting font' },
      { status: 500 }
    );
  }
}
