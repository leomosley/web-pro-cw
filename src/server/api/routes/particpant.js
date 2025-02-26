import { db } from '../../db/index.js';
import { generateRandomId } from '../../../lib/utils.js';


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

  if (!response) throw new Error('Participant doesnt exist');

  return response;
}

export async function createParticipant(request, reply) {
  while (true) {
    const id = generateRandomId();

    const exists = await db.get('SELECT * FROM participant WHERE participant_id=?;', id);

    if (!exists) {
      await db.run('INSERT INTO participant (participant_id) VALUES (?);', id);

      return { id };
    }
  }
}

export async function deleteParticipant(request, reply) {
  const { id } = request.params;

  return { message: `Delete race ${id}` };
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
    method: 'POST',
    url: '/api/participant',
    handler: createParticipant,
  },
  {
    method: 'DELETE',
    url: '/api/participant/:id',
    handler: deleteParticipant,
    requiredParams: ['id'],
  },
];
