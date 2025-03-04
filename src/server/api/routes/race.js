import { db } from '../../db/index.js';

export async function getAllRaces(request, reply) {
  return await db.all('SELECT * FROM race;');
}

export async function createRace(request, reply) {
  const { location_id, race_name, race_date, check_in_open_time, race_start_time } = request.body;

  const response = await db.run(
    `INSERT INTO race (location_id, race_name, race_date, check_in_open_time, race_start_time) VALUES 
      (?, ?, ?, ?, ?);`
    , [location_id, race_name, race_date, check_in_open_time, race_start_time]);


  if (!response) throw new Error('Error');

  return response;
}

export async function getRace(request, reply) {
  const { id } = request.params;

  const raceResponse = await db.get('SELECT * FROM race WHERE race_id = ?;', [id]);

  if (!raceResponse) throw new Error('Not found');

  const locationResponse = await db.get('SELECT * FROM location WHERE location_id=?', [raceResponse.location_id]);

  const checkpointsResponse = await db.all('SELECT * FROM checkpoint AS c JOIN race_checkpoint AS rc ON c.checkpoint_id = rc.checkpoint_id WHERE rc.race_id=?', [id]);

  return {
    ...raceResponse,
    location: locationResponse,
    checkpoints: checkpointsResponse,
  };
}

export async function checkInParticipant(request, reply) {
  const { id } = request.params;
  const { participant_id } = request.body;

  const response = await db.run(`
      UPDATE race_participant
      SET checked_in = TRUE
      WHERE race_id = ? AND participant_id = ?;
      `, [id, participant_id]);

  if (!response) throw new Error('Not found');

  return response;
}

export async function checkOutParticipant(request, reply) {
  const { id } = request.params;
  const { participant_id, end_time } = request.body;

  const response = await db.run(`
    UPDATE race_participant
    SET end_time = ?
    WHERE race_id = ? AND participant_id = ?;
    `, [end_time, id, participant_id]);

  if (!response) throw new Error('Not found');

  return response;
}

export async function updateRace(request, reply) {
  const { id } = request.params;
  const body = request.body;

  return { message: `Update race ${id}` };
}

export async function startRace(request, reply) {
  const { id } = request.params;
  const { race_start_time } = request.body;

  const response = await db.run(`
    UPDATE race
    SET race_start_time = ?
    WHERE race_id = ?;
    `, [race_start_time, id]);

  if (!response) throw new Error('Not found');

  return response;
}

export async function deleteRace(request, reply) {
  const { id } = request.params;

  return { message: `Delete race ${id}` };
}

export const raceRoutes = [
  {
    method: 'GET',
    url: '/api/race',
    handler: getAllRaces,
  },
  {
    method: 'POST',
    url: '/api/race',
    handler: createRace,
    requiredParams: ['location_id', 'race_name', 'race_date', 'check_in_open_time', 'race_start_time'],
  },
  {
    method: 'GET',
    url: '/api/race/:id',
    handler: getRace,
    requiredParams: ['id'],
  },
  {
    method: 'PATCH',
    url: '/api/race/:id/check-in',
    handler: checkInParticipant,
    requiredParams: ['id', 'participant_id'],
  },
  {
    method: 'PATCH',
    url: '/api/race/:id/check-out',
    handler: checkOutParticipant,
    requiredParams: ['id', 'participant_id', 'end_time'],
  },
  {
    method: 'PATCH',
    url: '/api/race/:id',
    handler: updateRace,
    requiredParams: ['id'],
  },
  {
    method: 'PATCH',
    url: '/api/race/:id/start',
    handler: startRace,
    requiredParams: ['id', 'race_start_time'],
  },
  {
    method: 'DELETE',
    url: '/api/race/:id',
    handler: deleteRace,
    requiredParams: ['id'],
  },
];
