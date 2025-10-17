import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { promises as fs } from 'fs';

const PUBLIC_DIR = join(process.cwd(), 'public');

export async function POST(req: NextRequest) {
  try {
    await fs.mkdir(PUBLIC_DIR, { recursive: true });
    
    const data = await req.formData();
    const file: File | null = data.get('logo') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No logo file uploaded.' }, { status: 400 });
    }
    
    const allowedTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ success: false, message: `Invalid file type. Only ${allowedTypes.join(', ')} are permitted.` }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save with a fixed name to be easily referenced, e.g., /logo.svg
    const extension = file.name.split('.').pop();
    const filename = `logo.${extension}`;
    const path = join(PUBLIC_DIR, 'logo.svg'); // Always save as logo.svg for consistency
    
     // Delete old logo files if they exist to prevent conflicts
    const oldSvg = join(PUBLIC_DIR, 'logo.svg');
    const oldPng = join(PUBLIC_DIR, 'logo.png');
    const oldJpg = join(PUBLIC_DIR, 'logo.jpg');
    
    try { await fs.unlink(oldSvg); } catch (e) {}
    try { await fs.unlink(oldPng); } catch (e) {}
    try { await fs.unlink(oldJpg); } catch (e) {}

    await writeFile(path, buffer);
    console.log(`Logo uploaded to ${path}`);
    
    return NextResponse.json({ success: true, message: "Logo uploaded successfully." });
  } catch (error) {
    console.error('Error saving logo:', error);
    return NextResponse.json({ success: false, message: 'Error saving logo file.' }, { status: 500 });
  }
}
