import { Database } from 'sqlite';

export async function updateSchema(db: Database) {
  await db.exec(`
    -- Files table for storing uploaded files (fonts, logos, etc.)
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- 'font', 'logo', 'favicon', etc.
      path TEXT NOT NULL,
      mime_type TEXT,
      size INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      metadata TEXT -- JSON string for additional metadata
    );

    -- Settings categories for better organization
    CREATE TABLE IF NOT EXISTS setting_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Enhanced settings table with categories and types
    CREATE TABLE IF NOT EXISTS settings_enhanced (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      key TEXT NOT NULL,
      value TEXT,
      type TEXT NOT NULL, -- 'string', 'number', 'boolean', 'json', etc.
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES setting_categories (id),
      UNIQUE(category_id, key)
    );

    -- Payment methods configuration
    CREATE TABLE IF NOT EXISTS payment_methods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      enabled BOOLEAN DEFAULT true,
      details TEXT, -- JSON string for payment details
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Client platforms configuration
    CREATE TABLE IF NOT EXISTS client_platforms (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL,
      download_url TEXT,
      guide_content TEXT,
      enabled BOOLEAN DEFAULT true,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed initial setting categories
  const categories = [
    { id: 'general', name: 'General Settings', description: 'Basic site configuration' },
    { id: 'fonts', name: 'Font Settings', description: 'Persian and English font configuration' },
    { id: 'landing', name: 'Landing Page', description: 'Homepage and landing page settings' },
    { id: 'payment', name: 'Payment Settings', description: 'Payment methods and configuration' },
    { id: 'telegram', name: 'Telegram Settings', description: 'Telegram bot and notification settings' },
    { id: 'clients', name: 'Client Settings', description: 'Client download links and guides' }
  ];

  for (const category of categories) {
    await db.run(
      'INSERT OR IGNORE INTO setting_categories (id, name, description) VALUES (?, ?, ?)',
      [category.id, category.name, category.description]
    );
  }

  // Add foreign key for files in settings
  await db.exec(`
    PRAGMA foreign_keys = OFF;
    
    -- Create temporary table
    CREATE TABLE settings_enhanced_temp (
      id TEXT PRIMARY KEY,
      category_id TEXT,
      key TEXT NOT NULL,
      value TEXT,
      type TEXT NOT NULL,
      description TEXT,
      file_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES setting_categories (id),
      FOREIGN KEY (file_id) REFERENCES files (id),
      UNIQUE(category_id, key)
    );

    -- Copy data
    INSERT INTO settings_enhanced_temp 
    SELECT id, category_id, key, value, type, description, NULL, created_at, updated_at 
    FROM settings_enhanced;

    -- Drop old table
    DROP TABLE settings_enhanced;

    -- Rename new table
    ALTER TABLE settings_enhanced_temp RENAME TO settings_enhanced;
    
    PRAGMA foreign_keys = ON;
  `);

  // Migration: Move existing settings to new structure
  const oldSettings = await db.all('SELECT * FROM settings');
  for (const setting of oldSettings) {
    const categoryId = getCategoryFromKey(setting.key);
    await db.run(
      'INSERT OR REPLACE INTO settings_enhanced (category_id, key, value, type) VALUES (?, ?, ?, ?)',
      [categoryId, setting.key, setting.value, guessValueType(setting.value)]
    );
  }
}

function getCategoryFromKey(key: string): string {
  if (key.startsWith('font_')) return 'fonts';
  if (key.startsWith('hero_') || key.startsWith('landing_')) return 'landing';
  if (key.startsWith('payment_')) return 'payment';
  if (key.startsWith('telegram_')) return 'telegram';
  if (key.startsWith('client_')) return 'clients';
  return 'general';
}

function guessValueType(value: string): string {
  if (value === 'true' || value === 'false') return 'boolean';
  if (!isNaN(Number(value))) return 'number';
  try {
    JSON.parse(value);
    return 'json';
  } catch {
    return 'string';
  }
}
