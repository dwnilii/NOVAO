import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { promises as fs } from 'fs';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  // Ensure the uploads directory exists
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const path = join(uploadDir, filename);

  try {
    await writeFile(path, buffer);
    console.log(`File uploaded to ${path}`);
    
    // Return the public URL path
    const url = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, message: 'Error saving file.' }, { status: 500 });
  }
}
