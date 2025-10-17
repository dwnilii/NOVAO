import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('logo') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save as SVG in public directory
    const filePath = path.join(process.cwd(), 'public', 'logo.svg');
    await writeFile(filePath, buffer);
    
    // Also update favicon
    const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico');
    await writeFile(faviconPath, buffer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
