'use server';

/**
 * @file This file implements the API layer for anaging the application.
 * It handles all CRUD operations for users, plans, orders, settings, and backups.
 */
import { getDb } from './db';
import type { User, Order, PricingPlan, BackupFile, Feature, CartItem } from './types';
import { promises as fs, statSync, existsSync } from 'fs';
import path from 'path';

const DB_PATH = process.env.DATABASE_PATH || './novao.db';
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');


// --- User Management ---

export async function getUsers(): Promise<User[]> {
  const db = await getDb();
  const users = await db.all<User[]>("SELECT * FROM users WHERE name != 'admin' ORDER BY registered DESC");
  return users;
}

export async function addUser(newUser: Omit<User, 'id' | 'registered'>): Promise<User> {
    const db = await getDb();
    const id = `usr_${Math.random().toString(36).substr(2, 9)}`;
    const registered = new Date().toISOString().split('T')[0];
    
    await db.run(
        "INSERT INTO users (id, name, uuid, password, subscription, usage, total, registered, config, sublink, expiryDate, planTitle) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        id, newUser.name, newUser.uuid, newUser.password, newUser.subscription, newUser.usage, newUser.total, registered, newUser.config, newUser.sublink, newUser.expiryDate, newUser.planTitle
    );

    const createdUser = await db.get<User>('SELECT * FROM users WHERE id = ?', id);
    if (!createdUser) throw new Error('Failed to create user.');
    return createdUser;
}

export async function updateUser(updatedUser: User): Promise<User> {
    const db = await getDb();

    const { id, ...fieldsToUpdate } = updatedUser;

    const filteredFields = Object.entries(fieldsToUpdate).filter(([key, value]) => {
        if (value === null || value === undefined) return false;
        if (key === 'password' && value === '') return false;
        return true;
    });
    
    if (filteredFields.length === 0) {
        console.log("No fields to update for user:", id);
        return updatedUser;
    }

    const setClause = filteredFields.map(([key, _]) => `${key} = ?`).join(', ');
    const values = filteredFields.map(([_, value]) => value);

    await db.run(`UPDATE users SET ${setClause} WHERE id = ?`, ...values, id);

    const user = await db.get<User>("SELECT * FROM users WHERE id = ?", id);
    if (!user) throw new Error('Failed to fetch updated user.');
    return user;
}


export async function findUserByUsername(username: string): Promise<User | undefined> {
    const db = await getDb();
    const user = await db.get<User>("SELECT * FROM users WHERE name = ?", username);
    return user;
}


// --- Pricing Plan Management ---
export async function getPricingPlans(): Promise<PricingPlan[]> {
  const db = await getDb();
  const plans = await db.all<PricingPlan[]>("SELECT * FROM pricing_plans ORDER BY sortOrder ASC");
  return plans.map(p => ({...p, features: JSON.parse(p.features as unknown as string || '[]') }));
}

export async function addPricingPlan(plan: Omit<PricingPlan, 'id'>): Promise<PricingPlan> {
  const db = await getDb();
  const id = `plan_${Math.random().toString(36).substr(2, 9)}`;
  await db.run(
    "INSERT INTO pricing_plans (id, title, price, period, data, devices, duration, features, popular, available, showOnLanding, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    id, plan.title, plan.price, plan.period, plan.data, plan.devices, plan.duration, JSON.stringify(plan.features), plan.popular, plan.available, plan.showOnLanding, plan.sortOrder
  );
  const newPlan = await db.get<PricingPlan>("SELECT * FROM pricing_plans WHERE id = ?", id);
  if (!newPlan) throw new Error('Failed to create pricing plan.');
  return {...newPlan, features: JSON.parse(newPlan.features as unknown as string)};
}

export async function updatePricingPlan(plan: PricingPlan): Promise<PricingPlan> {
    const db = await getDb();
    await db.run(
        "UPDATE pricing_plans SET title = ?, price = ?, period = ?, data = ?, devices = ?, duration = ?, features = ?, popular = ?, available = ?, showOnLanding = ?, sortOrder = ? WHERE id = ?",
        plan.title, plan.price, plan.period, plan.data, plan.devices, plan.duration, JSON.stringify(plan.features), plan.popular, plan.available, plan.showOnLanding, plan.sortOrder, plan.id
    );
    const updatedPlan = await db.get<PricingPlan>("SELECT * FROM pricing_plans WHERE id = ?", plan.id);
    if (!updatedPlan) throw new Error('Failed to update pricing plan.');
    return {...updatedPlan, features: JSON.parse(updatedPlan.features as unknown as string)};
}

export async function deletePricingPlan(id: string): Promise<{success: boolean}> {
    const db = await getDb();
    await db.run("DELETE FROM pricing_plans WHERE id = ?", id);
    return { success: true };
}


// --- Traffic Pack Management ---
export async function getTrafficPacks(): Promise<PricingPlan[]> {
  const db = await getDb();
  return await db.all<PricingPlan[]>("SELECT * FROM traffic_packs");
}

export async function addTrafficPack(pack: Omit<PricingPlan, 'id' | 'period' | 'devices' | 'features' | 'popular' | 'showOnLanding' | 'sortOrder'>): Promise<PricingPlan> {
  const db = await getDb();
  const id = `traffic_${Math.random().toString(36).substr(2, 9)}`;
  await db.run(
    "INSERT INTO traffic_packs (id, title, price, data, duration, available) VALUES (?, ?, ?, ?, ?, ?)",
    id, pack.title, pack.price, pack.data, pack.duration || 'Never Expires', pack.available
  );
  const newPack = await db.get<PricingPlan>("SELECT * FROM traffic_packs WHERE id = ?", id);
  if(!newPack) throw new Error('Failed to create traffic pack.');
  return newPack;
}

export async function updateTrafficPack(pack: PricingPlan): Promise<PricingPlan> {
    const db = await getDb();
    await db.run(
        "UPDATE traffic_packs SET title = ?, price = ?, data = ?, available = ? WHERE id = ?",
        pack.title, pack.price, pack.data, pack.available, pack.id
    );
    const updatedPack = await db.get<PricingPlan>("SELECT * FROM traffic_packs WHERE id = ?", pack.id);
     if(!updatedPack) throw new Error('Failed to update traffic pack.');
    return updatedPack;
}

export async function deleteTrafficPack(id: string): Promise<{success: boolean}> {
    const db = await getDb();
    await db.run("DELETE FROM traffic_packs WHERE id = ?", id);
    return { success: true };
}


// --- Order Management ---
export async function getOrders(): Promise<Order[]> {
  const db = await getDb();
  const orders = await db.all<Order[]>("SELECT * FROM orders ORDER BY date DESC");
  return orders.map(o => ({...o, items: JSON.parse(o.items as unknown as string || '[]')}));
}

export async function addOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const db = await getDb();
    const id = `ord_${Date.now()}`;
    
    // Sanitize prices before inserting into the database
    const sanitizedTotal = parseFloat(String(order.totalAmount).replace(/[^0-9.]/g, ''));
    const sanitizedItems = order.items.map(item => ({
        ...item,
        price: parseFloat(String(item.price).replace(/[^0-9.]/g, ''))
    }));

    await db.run(
        "INSERT INTO orders (id, user_id, user_name, items, totalAmount, status, date, paymentProof, paymentType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        id, order.user_id, order.user_name, JSON.stringify(sanitizedItems), sanitizedTotal, order.status, order.date, order.paymentProof, order.paymentType
    );
    const newOrder = await db.get<Order>("SELECT * FROM orders WHERE id = ?", id);
    if (!newOrder) throw new Error('Failed to create order.');
    return {...newOrder, items: JSON.parse(newOrder.items as unknown as string)};
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const db = await getDb();
    await db.run("UPDATE orders SET status = ? WHERE id = ?", status, orderId);
    const updatedOrder = await db.get<Order>("SELECT * FROM orders WHERE id = ?", orderId);
    if (!updatedOrder) throw new Error('Failed to update order.');
    return {...updatedOrder, items: JSON.parse(updatedOrder.items as unknown as string)};
}

export async function deleteOrder(orderId: string): Promise<{ success: boolean }> {
    const response = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Failed to delete order');
    }
    return response.json();
}


// --- Settings Management ---

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const result = await db.get<{ value: string }>("SELECT value FROM settings WHERE key = ?", key);
  return result?.value ?? null;
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.run(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    key,
    value
  );
}

// --- Features Management ---

export async function getFeatures(): Promise<Feature[]> {
  const db = await getDb();
  return await db.all<Feature[]>("SELECT * FROM features ORDER BY sortOrder ASC");
}

export async function addFeature(feature: Omit<Feature, 'id'>): Promise<Feature> {
  const db = await getDb();
  const id = `feat_${Math.random().toString(36).substr(2, 9)}`;
  await db.run(
    "INSERT INTO features (id, icon, title, description, sortOrder) VALUES (?, ?, ?, ?, ?)",
    id, feature.icon, feature.title, feature.description, feature.sortOrder
  );
  const newFeature = await db.get<Feature>("SELECT * FROM features WHERE id = ?", id);
  if (!newFeature) throw new Error('Failed to create feature.');
  return newFeature;
}

export async function updateFeature(feature: Feature): Promise<Feature> {
  const db = await getDb();
  await db.run(
    "UPDATE features SET icon = ?, title = ?, description = ?, sortOrder = ? WHERE id = ?",
    feature.icon, feature.title, feature.description, feature.sortOrder, feature.id
  );
  const updatedFeature = await db.get<Feature>("SELECT * FROM features WHERE id = ?", feature.id);
  if (!updatedFeature) throw new Error('Failed to update feature.');
  return updatedFeature;
}

export async function deleteFeature(id: string): Promise<{ success: boolean }> {
  const db = await getDb();
  await db.run("DELETE FROM features WHERE id = ?", id);
  return { success: true };
}


// --- API Function for Fetching Live Data from 3x-ui Panel (used by User Dashboard) ---
export async function getLiveUserData(userIdentifier: string): Promise<Partial<User> | null> {
  // This function is now a placeholder as the live API connection is removed.
  // It will return null, and the dashboard will rely on DB data.
  return null;
}

// --- Backup & Restore Management ---

export async function createBackup(): Promise<{ success: boolean; message: string; filename?: string; }> {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, filename);
    await fs.copyFile(DB_PATH, backupPath);
    return { success: true, message: 'Backup created successfully!', filename };
  } catch (error: any) {
    console.error('Failed to create backup:', error);
    return { success: false, message: error.message || 'An unknown error occurred during backup.' };
  }
}

export async function getBackups(): Promise<BackupFile[]> {
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files
      .filter(file => file.endsWith('.db'))
      .map(file => {
        const stats = statSync(path.join(BACKUP_DIR, file));
        return {
          name: file,
          size: stats.size,
          createdAt: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return backupFiles;
  } catch (error) {
    console.error('Failed to get backups:', error);
    return [];
  }
}

export async function restoreBackup(filename: string): Promise<{ success: boolean; message: string; }> {
  const backupPath = path.join(BACKUP_DIR, filename);
  try {
    if (!existsSync(backupPath)) {
      return { success: false, message: 'Backup file not found.' };
    }
    await fs.copyFile(backupPath, DB_PATH);
    return { success: true, message: 'Database restored successfully! The application may need to restart to see changes.' };
  } catch (error: any) {
    console.error(`Failed to restore backup ${filename}:`, error);
    return { success: false, message: error.message || 'An unknown error occurred during restore.' };
  }
}

export async function uploadBackup(file: File): Promise<{ success: boolean; message: string; filename?: string; }> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/backups/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Upload failed');
        }

        return { success: true, message: 'Upload successful', filename: result.filename };
    } catch (error: any) {
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}

export async function deleteBackup(filename: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/api/backups/delete/${filename}`, { method: 'DELETE' });
    if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.message || 'Failed to delete backup');
    }
  return response.json();
}


// --- Uploaded Files Management ---
interface UploadedFile {
    name: string;
    url: string;
    size: number;
    createdAt: string;
}

export async function getUploadedFiles(): Promise<UploadedFile[]> {
    const response = await fetch('/api/uploads', { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch files');
    return response.json();
}

export async function deleteUploadedFile(filename: string): Promise<{ success: boolean, message: string }> {
    const response = await fetch(`/api/uploads/${filename}`, { method: 'DELETE' });
    return response.json();
}

export async function deleteAllUploadedFiles(): Promise<{ success: boolean, message: string }> {
    const response = await fetch('/api/uploads', { method: 'DELETE' });
    return response.json();
}
