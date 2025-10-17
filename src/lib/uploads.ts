import { promises as fs } from 'fs';
import { join } from 'path';

interface FileInfo {
  name: string;
  path: string;
  createdAt: number;
}

export async function cleanupOldUploads(maxAge: number = 30 * 24 * 60 * 60 * 1000) { // Default 30 days
  try {
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Read all files in the uploads directory
    const files = await fs.readdir(uploadDir);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = join(uploadDir, file);
      const stats = await fs.stat(filePath);
      
      // Check if file is older than maxAge
      if (now - stats.ctimeMs > maxAge) {
        try {
          await fs.unlink(filePath);
          console.log(`Deleted old file: ${file}`);
        } catch (error) {
          console.error(`Error deleting file ${file}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning up old uploads:', error);
  }
}

export async function getAllUploads(): Promise<FileInfo[]> {
  try {
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const files = await fs.readdir(uploadDir);
    
    const fileInfos = await Promise.all(
      files.map(async (file) => {
        const filePath = join(uploadDir, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: filePath,
          createdAt: stats.ctimeMs,
        };
      })
    );

    // Sort by creation time, newest first
    return fileInfos.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error getting uploads:', error);
    return [];
  }
}
