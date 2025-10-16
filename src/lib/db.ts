'use server';

/**
 * @file This file is responsible for initializing and managing the SQLite database connection.
 * It ensures the database schema is up-to-date and seeds initial data if necessary.
 */
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';
import fs from 'fs-extra';

const DB_PATH = process.env.DATABASE_PATH || './novao.db';

let dbInstance: Promise<Database> | null = null;

async function initializeDb(): Promise<Database> {
  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });

  console.log('Connected to the SQLite database.');

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      uuid TEXT NOT NULL,
      password TEXT,
      subscription TEXT,
      usage INTEGER,
      total INTEGER,
      registered TEXT,
      config TEXT,
      sublink TEXT,
      expiryDate TEXT,
      planTitle TEXT
    );

    CREATE TABLE IF NOT EXISTS pricing_plans (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price TEXT,
      period TEXT,
      data TEXT,
      devices TEXT,
      duration TEXT,
      features TEXT, -- JSON string
      popular BOOLEAN,
      available BOOLEAN,
      showOnLanding BOOLEAN,
      sortOrder INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS traffic_packs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        price TEXT,
        data TEXT,
        duration TEXT,
        available BOOLEAN
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT,
      items TEXT, -- JSON string
      totalAmount REAL,
      status TEXT,
      date TEXT,
      paymentProof TEXT,
      paymentType TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
    );
    
    CREATE TABLE IF NOT EXISTS features (
      id TEXT PRIMARY KEY,
      icon TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      sortOrder INTEGER
    );
  `);
  
  const userColumns = await db.all("PRAGMA table_info(users)");
  if (!userColumns.some(c => c.name === 'planTitle')) {
      await db.exec('ALTER TABLE users ADD COLUMN planTitle TEXT');
      console.log('Added planTitle column to users table.');
  }

  const planColumns = await db.all("PRAGMA table_info(pricing_plans)");
  if (!planColumns.some(c => c.name === 'showOnLanding')) {
      await db.exec('ALTER TABLE pricing_plans ADD COLUMN showOnLanding BOOLEAN DEFAULT FALSE');
      console.log('Added showOnLanding column to pricing_plans table.');
  }
   if (!planColumns.some(c => c.name === 'sortOrder')) {
      await db.exec('ALTER TABLE pricing_plans ADD COLUMN sortOrder INTEGER DEFAULT 0');
      console.log('Added sortOrder column to pricing_plans table.');
  }
  
  const orderColumns = await db.all("PRAGMA table_info(orders)");
  if (orderColumns.some(c => c.name === 'recipientUsername')) {
      console.log('Migrating recipientUsername from orders table...');
      await db.exec('CREATE TABLE orders_new (id TEXT PRIMARY KEY, user_id TEXT, user_name TEXT, items TEXT, totalAmount REAL, status TEXT, date TEXT, paymentProof TEXT, paymentType TEXT, FOREIGN KEY (user_id) REFERENCES users (id));');
      await db.exec('INSERT INTO orders_new (id, user_id, user_name, items, totalAmount, status, date, paymentProof, paymentType) SELECT id, user_id, user_name, items, totalAmount, status, date, paymentProof, paymentType FROM orders;');
      await db.exec('DROP TABLE orders;');
      await db.exec('ALTER TABLE orders_new RENAME TO orders;');
      console.log('recipientUsername column removed from orders table.');
  }


  console.log('Database tables ensured.');

  await seedAdminUser(db);
  await seedInitialFeatures(db);

  return db;
}

async function seedAdminUser(db: Database) {
    const adminUser = await db.get("SELECT * FROM users WHERE name = 'admin'");
    if (!adminUser) {
        console.log('Admin user not found, seeding admin...');
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
        await db.run(
            "INSERT INTO users (id, name, uuid, password, subscription, usage, total, registered, planTitle) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            'admin_user', 'admin', 'admin_uuid_placeholder', adminPassword, 'active', 0, 0, new Date().toISOString().split('T')[0], 'Admin Access'
        );
        console.log('Admin user seeded.');
    }
}

async function seedInitialFeatures(db: Database) {
    const featuresCount = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM features");
    if (featuresCount && featuresCount.count === 0) {
        console.log('Seeding initial features...');
        const initialFeatures = [
            { id: 'feat_1', icon: 'Zap', title: 'Blazing Fast Speed', description: 'Enjoy ultra-fast connection speeds for seamless streaming and browsing.', sortOrder: 1 },
            { id: 'feat_2', icon: 'ShieldCheck', title: 'Top-Tier Security', description: 'Your online activity is protected with military-grade encryption.', sortOrder: 2 },
            { id: 'feat_3', icon: 'Globe', title: 'Global Server Network', description: 'Access content from anywhere with our vast network of servers.', sortOrder: 3 },
            { id: 'feat_4', icon: 'Users', title: 'Multi-Device Support', description: 'Use Novao on all your devices with a single subscription.', sortOrder: 4 },
        ];
        
        const stmt = await db.prepare("INSERT INTO features (id, icon, title, description, sortOrder) VALUES (?, ?, ?, ?, ?)");
        for (const feature of initialFeatures) {
            await stmt.run(feature.id, feature.icon, feature.title, feature.description, feature.sortOrder);
        }
        await stmt.finalize();
        console.log('Initial features seeded.');
    }
}

export async function getDb(): Promise<Database> {
    const dbFileExists = await fs.pathExists(DB_PATH);

    if (!dbFileExists && dbInstance) {
        console.log('Database file not found. Re-initializing connection.');
        const db = await dbInstance;
        await db.close();
        dbInstance = null;
    }

    if (!dbInstance) {
        dbInstance = initializeDb();
    }
    return dbInstance;
}
