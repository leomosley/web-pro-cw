import { Database } from "sqlite";

export async function seed(db) {
  if (!(db instanceof Database)) throw new Error("`db` must be an instance of Database.");

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

    console.log("Database seeding complete");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}