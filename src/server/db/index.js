import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { seed } from './seed.js';
import { isDatabaseEmpty } from '../../utils/is-database-empty.js';

async function init() {
  try {
    const migrationsPath = path.join("src", "server", "db", "migrations");
    const filePath = path.join("src", "server", "db");

    const db = await open({
      filename: path.join(filePath, './database.sqlite'),
      driver: sqlite3.Database,
      verbose: true
    });

    await db.migrate({ migrationsPath });

    // If db has now values seed it
    if (await isDatabaseEmpty(db)) await seed(db);

    console.log("Database initialized successfully.");
    return db;

  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export const db = await init();