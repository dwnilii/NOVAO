import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('font') as File;
    const type = formData.get('type') as string;
    
    if (!file || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create directory if it doesn't exist
    const fontDir = path.join(process.cwd(), 'public', 'fonts');
    const fileName = `${type}_${Date.now()}_${file.name}`;
    const filePath = path.join(fontDir, fileName);
    
    // Save the font file
    await writeFile(filePath, buffer);
    
    return NextResponse.json({ 
      success: true,
      path: `/fonts/${fileName}`
    });
  } catch (error) {
    console.error('Error uploading font:', error);
    return NextResponse.json(
      { error: 'Error uploading font' },
      { status: 500 }
    );
  }
}
