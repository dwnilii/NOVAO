'use server';

import { getDb } from '@/lib/db';
import type { AdminSettings } from '../types/admin-settings';

export async function getSettings(categoryId?: string): Promise<Record<string, any>> {
  const db = await getDb();
  let query = 'SELECT * FROM settings_enhanced';
  const params = [];
  
  if (categoryId) {
    query += ' WHERE category_id = ?';
    params.push(categoryId);
  }
  
  const settings = await db.all(query, ...params);
  const result: Record<string, any> = {};

  for (const setting of settings) {
    const value = parseSettingValue(setting.value, setting.type);
    result[setting.key] = value;
  }

  return result;
}

export async function updateSettings(
  categoryId: string,
  settings: Record<string, any>
): Promise<void> {
  const db = await getDb();
  
  for (const [key, value] of Object.entries(settings)) {
    const type = getValueType(value);
    const stringValue = stringifySettingValue(value);
    
    await db.run(
      `INSERT OR REPLACE INTO settings_enhanced 
       (category_id, key, value, type) 
       VALUES (?, ?, ?, ?)`,
      [categoryId, key, stringValue, type]
    );
  }
}

export async function uploadFile(
  file: File,
  type: string,
  metadata?: Record<string, any>
): Promise<{ id: string; path: string }> {
  const db = await getDb();
  const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  await db.run(
    `INSERT INTO files (id, name, type, path, mime_type, size, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      file.name,
      type,
      `/uploads/${id}_${file.name}`,
      file.type,
      file.size,
      metadata ? JSON.stringify(metadata) : null
    ]
  );

  return {
    id,
    path: `/uploads/${id}_${file.name}`
  };
}

export async function deleteFile(id: string): Promise<void> {
  const db = await getDb();
  await db.run('DELETE FROM files WHERE id = ?', [id]);
}

function parseSettingValue(value: string, type: string): any {
  switch (type) {
    case 'boolean':
      return value === 'true';
    case 'number':
      return Number(value);
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    default:
      return value;
  }
}

function stringifySettingValue(value: any): string {
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function getValueType(value: any): string {
  switch (typeof value) {
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    case 'object':
      return 'json';
    default:
      return 'string';
  }
}
