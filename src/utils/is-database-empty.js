import { Database } from "sqlite";

export async function isDatabaseEmpty(db) {
  if (!(db instanceof Database)) throw new Error("`db` must be an instance of Database.");

  const tables = ["location", "race", "checkpoint", "race_checkpoint"];

  for (const table of tables) {
    const result = await db.get(`SELECT COUNT(*) AS count FROM ${table};`);
    if (result.count > 0) return false;
  }

  return true;
}