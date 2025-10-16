import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import { stat, readdir } from 'fs/promises';

const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Helper to ensure directory exists
const ensureBackupDir = async () => {
  try {
    await fs.ensureDir(BACKUP_DIR);
  } catch (error) {
    console.error('Failed to ensure backup directory exists:', error);
    throw new Error('Server configuration error for backups.');
  }
};

/**
 * GET /api/backups/download/[filename]
 * Handles downloading a specific backup file.
 */
async function downloadBackup(req: NextRequest, { params }: { params: { parts: string[] } }) {
  await ensureBackupDir();
  const filename = params.parts[1];

  if (!filename || !/^[a-zA-Z0-9_.-]+\.db$/.test(filename)) {
    return NextResponse.json({ message: 'Invalid filename.' }, { status: 400 });
  }

  const filePath = path.join(BACKUP_DIR, filename);

  try {
    // Check if file exists and is within the backup directory to prevent path traversal attacks
    const fileStat = await stat(filePath);
    if (!fileStat.isFile() || path.dirname(filePath) !== BACKUP_DIR) {
      throw new Error('File not found or access denied.');
    }

    const fileBuffer = await fs.readFile(filePath);

    const headers = new Headers();
    headers.set('Content-Type', 'application/x-sqlite3');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Length', fileBuffer.length.toString());

    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (error) {
    console.error(`Failed to read backup file ${filename}:`, error);
    return NextResponse.json({ message: 'Backup file not found or could not be read.' }, { status: 404 });
  }
}

/**
 * POST /api/backups/upload
 * Handles uploading a new backup file.
 */
async function uploadBackup(req: NextRequest) {
  await ensureBackupDir();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    if (!file.name.endsWith('.db')) {
        return NextResponse.json({ message: 'Invalid file type. Only .db files are allowed.' }, { status: 400 });
    }

    const sanitizedFilename = path.basename(file.name);
    const filePath = path.join(BACKUP_DIR, sanitizedFilename);
    
    // Check if file already exists to prevent overwriting
    const filesInDir = await readdir(BACKUP_DIR);
    if (filesInDir.includes(sanitizedFilename)) {
        return NextResponse.json({ message: `File '${sanitizedFilename}' already exists. Please rename and try again.` }, { status: 409 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ success: true, message: 'Backup uploaded successfully.', filename: sanitizedFilename }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to upload backup:', error);
    return NextResponse.json({ message: error.message || 'An unknown error occurred during upload.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { parts: string[] } }) {
    if (params.parts[0] === 'download') {
        return downloadBackup(req, { params });
    }
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: { parts: string[] } }) {
    if (params.parts[0] === 'upload') {
        return uploadBackup(req);
    }
    return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}
