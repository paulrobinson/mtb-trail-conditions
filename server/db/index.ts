import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'fs';
import path from 'path';
import * as schema from './schema.js';

const DB_PATH = path.resolve(process.cwd(), 'data/weather.db');

mkdirSync(path.dirname(DB_PATH), { recursive: true });

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist (avoids needing a migration step for dev)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS weather_cache (
    centre_id TEXT PRIMARY KEY,
    data      TEXT NOT NULL,
    fetched_at INTEGER NOT NULL
  )
`);
