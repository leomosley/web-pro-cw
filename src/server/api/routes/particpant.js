import { db } from '../../db/index.js';
import { generateRandomId } from '../../utils.mjs';

export async function getAllParticipants(request, reply) {
  return await db.all('SELECT * FROM participant;');
}

export async function getParticipant(request, reply) {
  const { id } = request.params;
  const response = db.all(
    `SELECT *
       FROM 
        participant AS p
        JOIN race_participant AS rp USING (participant_id)
      WHERE p.participant_id=?;`, id);

  if (!response) {
    throw new Error('Participant doesnt exist');
  }

  return response;
}

export async function createParticipant(request, reply) {
  while (true) {
    const id = generateRandomId();

    const exists = await db.get('SELECT * FROM participant WHERE participant_id=?;', id);

    if (!exists) {
      await db.run('INSERT INTO participant (participant_id) VALUES (?);', id);

      return id;
    }
  }
}

export async function getAllParticipantsRaces(request, reply) {
  const { id } = request.params;

  return await db.all(`
    SELECT r.*
    FROM race r
    JOIN race_participant rp ON r.race_id = rp.race_id
    WHERE rp.participant_id = ?
    ORDER BY r.race_date DESC;`
  , [id]);
}

export const participantRoutes = [
  {
    method: 'GET',
    url: '/api/participant',
    handler: getAllParticipants,
  },
  {
    method: 'GET',
    url: '/api/participant/:id',
    handler: getParticipant,
    requiredParams: ['id'],
  },
  {
    method: 'GET',
    url: '/api/participant/:id/races',
    handler: getAllParticipantsRaces,
    requiredParams: ['id'],
  },
  {
    method: 'POST',
    url: '/api/participant',
    handler: createParticipant,
  },
];
