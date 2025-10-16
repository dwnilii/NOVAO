import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// Helper function to prevent path traversal
function sanitizeFilename(filename: string): string | null {
    const sanitized = path.basename(filename);
    if (sanitized !== filename || sanitized.includes('..')) {
        return null;
    }
    return sanitized;
}

export async function DELETE(req: NextRequest, { params }: { params: { filename: string } }) {
    await fs.ensureDir(UPLOAD_DIR);

    const filename = sanitizeFilename(params.filename);

    if (!filename) {
        return NextResponse.json({ message: 'Invalid filename.' }, { status: 400 });
    }
    
    const filePath = path.join(UPLOAD_DIR, filename);

    try {
        const fileExists = await fs.pathExists(filePath);
        if (!fileExists) {
            return NextResponse.json({ message: 'File not found.' }, { status: 404 });
        }

        await fs.remove(filePath);

        return NextResponse.json({ success: true, message: `File '${filename}' deleted successfully.` }, { status: 200 });
    } catch (error: any) {
        console.error(`Failed to delete file ${filename}:`, error);
        return NextResponse.json({ message: error.message || 'An unknown error occurred.' }, { status: 500 });
    }
}
