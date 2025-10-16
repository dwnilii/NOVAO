import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import fs from 'fs-extra';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

// GET all uploaded files
export async function GET(req: NextRequest) {
  await fs.ensureDir(UPLOAD_DIR);

  try {
    const filenames = await readdir(UPLOAD_DIR);
    const files = await Promise.all(
        filenames.map(async (name) => {
            const stats = await stat(join(UPLOAD_DIR, name));
            return {
                name,
                url: `/uploads/${name}`,
                size: stats.size,
                createdAt: stats.mtime.toISOString(),
            };
        })
    );
     // Sort by newest first
    const sortedFiles = files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(sortedFiles);
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    return NextResponse.json({ message: 'Error reading files.' }, { status: 500 });
  }
}

// POST a new file upload
export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file uploaded.' }, { status: 400 });
  }

  // Ensure the uploads directory exists
  await fs.ensureDir(UPLOAD_DIR);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create a unique filename
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const path = join(UPLOAD_DIR, filename);

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

// DELETE all uploaded files
export async function DELETE(req: NextRequest) {
    await fs.ensureDir(UPLOAD_DIR);

    try {
        const files = await readdir(UPLOAD_DIR);
        for (const file of files) {
            await fs.remove(join(UPLOAD_DIR, file));
        }
        return NextResponse.json({ success: true, message: 'All uploaded files have been deleted.' }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting all uploaded files:', error);
        return NextResponse.json({ message: error.message || 'An unknown error occurred.' }, { status: 500 });
    }
}
