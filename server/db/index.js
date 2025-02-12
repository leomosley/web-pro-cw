import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

async function init() {
  try {
    const db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database,
      verbose: true
    });

    await db.migrate({ migrationsPath: './migrations' });

    console.log("Database initialized successfully.");
    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

export const db = await init();