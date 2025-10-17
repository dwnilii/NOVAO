import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { promises as fs } from 'fs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        message: 'No file uploaded.' 
      }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid file type. Only JPG, PNG, and GIF files are allowed.' 
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        success: false, 
        message: 'File size exceeds 5MB limit.' 
      }, { status: 400 });
    }

    // Ensure the uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Create unique filename with original extension
    const extension = file.name.split('.').pop() || '';
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const filename = `${uniqueId}.${extension}`;
    const filePath = join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await writeFile(filePath, buffer);
    
    // Create database entry for the file
    const fileInfo = {
      name: file.name,
      path: filePath,
      url: `/uploads/${filename}`,
      size: file.size,
      type: file.type,
      createdAt: new Date().toISOString()
    };

    // Store file info in database
    // This will be handled by the uploads API endpoint that saves to the database

    return NextResponse.json({ 
      success: true, 
      url: `/uploads/${filename}`,
      fileInfo 
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing file upload.' 
    }, { status: 500 });
  }
}
