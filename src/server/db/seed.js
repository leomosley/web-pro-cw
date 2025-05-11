import { Database } from 'sqlite';
import { db } from './index.js';

export async function seed(db) {
  if (!(db instanceof Database)) {
    throw new Error('`db` must be an instance of Database.');
  }

  try {
    console.log('Seeding database...');

    await db.run(`
      INSERT INTO race (race_id, race_name, race_date, check_in_open_time, race_start_time, address_line_1, address_line_2, city, postcode)
      VALUES
        ('R1234', 'Pub to Pub', '2025-06-10', '07:00', '08:00', 'The Froddington Arms', NULL, 'Portsmouth', 'PO1 4ST'),
        ('R1235', 'Pier to Pier', '2025-06-10', '07:00', '08:00', 'Gunwarf Quays', NULL, 'Portsmouth', 'PO1 5RT');
    `);
    console.log('Inserted races');

    await db.run(`
      INSERT INTO race_checkpoint (race_id, checkpoint_position, checkpoint_name)
      VALUES
        ('R1234', 1, 'Start Line'),
        ('R1234', 2, 'Checkpoint A'),
        ('R1234', 3, 'Checkpoint B'),
        ('R1234', 4, 'Checkpoint C'),
        ('R1234', 5, 'Finish Line'),
        ('R1235', 1, 'Start Line'),
        ('R1235', 2, 'Checkpoint A'),
        ('R1235', 3, 'Checkpoint B'),
        ('R1235', 4, 'Checkpoint C'),
        ('R1235', 5, 'Finish Line');
    `);
    console.log('Inserted checkpoints');

    await db.run("INSERT INTO participant (participant_id) VALUES ('P1241');");
    await db.run("INSERT INTO participant (participant_id) VALUES ('P1214');");
    await db.run("INSERT INTO participant (participant_id) VALUES ('P1511');");
    await db.run("INSERT INTO participant (participant_id) VALUES ('P1600');");
    await db.run("INSERT INTO participant (participant_id) VALUES ('P1700');");
    console.log('Inserted participants');

    await db.run("INSERT INTO race_participant (race_id, participant_id, checked_in) VALUES ('R1234', 'P1241', FALSE);");
    await db.run("INSERT INTO race_participant (race_id, participant_id, checked_in) VALUES ('R1235', 'P1241', FALSE);");
    await db.run("INSERT INTO race_participant (race_id, participant_id, checked_in) VALUES ('R1234', 'P1214', FALSE);");
    await db.run("INSERT INTO race_participant (race_id, participant_id, checked_in) VALUES ('R1235', 'P1214', FALSE);");
    await db.run("INSERT INTO race_participant (race_id, participant_id, checked_in) VALUES ('R1234', 'P1511', FALSE);");
    await db.run("INSERT INTO race_participant (race_id, participant_id, checked_in) VALUES ('R1234', 'P1600', FALSE);");
    await db.run("INSERT INTO race_participant (race_id, participant_id, checked_in) VALUES ('R1234', 'P1700', FALSE);");
    console.log('Inserted initial race participants');

    await db.run(`
      INSERT INTO race_position (race_id, finish_position, finish_time)
      VALUES
        ('R1234', 1, '08:45:10'),
        ('R1234', 2, '08:45:25'),
        ('R1234', 3, '08:46:05'),
        ('R1234', 4, '08:47:00');
    `);
    console.log('Inserted race finish times by position for R1234');

    await db.run(`
      UPDATE race_participant
      SET
        finish_position = 2,
        end_time = (SELECT finish_time FROM race_position WHERE race_id = 'R1234' AND finish_position = 2)
      WHERE race_id = 'R1234' AND participant_id = 'P1241';
    `);

    await db.run(`
      UPDATE race_participant
      SET
        finish_position = 1,
        end_time = (SELECT finish_time FROM race_position WHERE race_id = 'R1234' AND finish_position = 1)
      WHERE race_id = 'R1234' AND participant_id = 'P1214';
    `);

    await db.run(`
      UPDATE race_participant
      SET
        finish_position = 4,
        end_time = (SELECT finish_time FROM race_position WHERE race_id = 'R1234' AND finish_position = 4)
      WHERE race_id = 'R1234' AND participant_id = 'P1511';
    `);

    await db.run(`
      UPDATE race_participant
      SET
        finish_position = 3,
        end_time = (SELECT finish_time FROM race_position WHERE race_id = 'R1234' AND finish_position = 3)
      WHERE race_id = 'R1234' AND participant_id = 'P1600';
    `);
    console.log('Updated race participants with finish data for R1234');

    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

async function main() {
  try {
    await seed(db);
  } catch (error) {
    console.error('Main seeding process failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === new URL(import.meta.url, import.meta.url).href) {
  main();
}
