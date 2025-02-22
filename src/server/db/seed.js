import { Database } from "sqlite";
import { db } from "./index.js";

export async function isDatabaseEmpty(db) {
  if (!(db instanceof Database)) throw new Error("`db` must be an instance of Database.");

  const tables = ["location", "race", "checkpoint", "race_checkpoint"];

  for (const table of tables) {
    const result = await db.get(`SELECT COUNT(*) AS count FROM ${table};`);
    if (result.count > 0) return false;
  }

  return true;
}

export async function seed(db) {
  if (!(db instanceof Database)) throw new Error("`db` must be an instance of Database.");

  const databaseEmpty = await isDatabaseEmpty(db);
  if (!databaseEmpty) throw new Error("Database already contains values, skipping seed process.");

  try {
    console.log("Seeding database...");

    const locationResult = await db.run(`
      INSERT INTO location (address_line_1, address_line_2, city, postcode)
      VALUES 
        ('Gravel Hill', NULL, 'Horndean', 'PO8 0QE');
    `);
    console.log("Inserted locations");

    // Insert into race
    await db.run(`
      INSERT INTO race (location_id, race_name, race_date, check_in_open_time, race_start_time)
      VALUES
        (1, 'Pub to Pub', '2025-06-10', '07:00', '08:00');
    `);
    console.log("Inserted races");

    // Insert into checkpoint
    await db.run(`
      INSERT INTO checkpoint (checkpoint_position, name)
      VALUES
      (1, 'Start Line'),
      (2, 'Checkpoint A'),
      (3, 'Checkpoint B'),
      (4, 'Checkpoint C'),
      (5, 'Finish Line');
    `);
    console.log("Inserted checkpoints");

    // Insert into race_checkpoint
    await db.run(`
      INSERT INTO race_checkpoint (race_id, checkpoint_id)
      VALUES
      (1, 1), (1, 2), (1, 3), (1, 4), (1, 5);
    `);
    console.log("Inserted race checkpoints");


    await db.run("INSERT INTO participant DEFAULT VALUES;");
    await db.run("INSERT INTO participant DEFAULT VALUES;");
    await db.run("INSERT INTO participant DEFAULT VALUES;");
    console.log("Inserted into participant");

    console.log("Database seeding complete");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

async function main() {
  seed(db);
}

// Optional: Run only if executed directly
if (import.meta.url === new URL(import.meta.url, import.meta.url).href) {
  main();
}