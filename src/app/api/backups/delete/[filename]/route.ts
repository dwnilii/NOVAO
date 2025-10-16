import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';

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
 * DELETE /api/backups/delete/[filename]
 * Handles deleting a specific backup file.
 */
export async function DELETE(req: NextRequest, { params }: { params: { filename: string } }) {
  await ensureBackupDir();
  const filename = params.filename;

  if (!filename || !/^[a-zA-Z0-9_.-]+\.db$/.test(filename)) {
    return NextResponse.json({ message: 'Invalid filename provided.' }, { status: 400 });
  }

  const filePath = path.join(BACKUP_DIR, filename);

  try {
    // Check if file exists and is within the backup directory to prevent path traversal attacks
    const fileExists = await fs.pathExists(filePath);
    if (!fileExists || path.dirname(filePath) !== BACKUP_DIR) {
      throw new Error('File not found or access denied.');
    }

    await fs.remove(filePath);

    return NextResponse.json({ success: true, message: `Backup file '${filename}' deleted successfully.` }, { status: 200 });
  } catch (error: any) {
    console.error(`Failed to delete backup file ${filename}:`, error);
    return NextResponse.json({ message: error.message || 'Backup file could not be deleted.' }, { status: 500 });
  }
}
