import { db } from '../../db/index.js';
import { generateRandomId } from '../../utils.mjs';

export async function getAllRaces(request, reply) {
  return await db.all('SELECT * FROM race;');
}

async function generateRaceId() {
  while (true) {
    const id = generateRandomId('R');

    const checkRace = await db.get('SELECT 1 FROM race WHERE race_id = ?', [id]);

    if (!checkRace) return id;
  }
}

export async function createRace(request, reply) {
  const race_id = await generateRaceId();
  const { race_name, race_date, check_in_open_time, race_start_time, checkpoints, address_line_1, address_line_2, city, postcode } = request.body;

  const raceResponse = await db.run(
    `INSERT INTO race (race_id, race_name, race_date, check_in_open_time, race_start_time, address_line_1, address_line_2, city, postcode) VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?);`
    , [race_id, race_name, race_date, check_in_open_time, race_start_time, address_line_1, address_line_2, city, postcode]);

  if (!raceResponse) throw new Error('Error creating race');

  for (const checkpoint of checkpoints) {
    const checkpointResponse = await db.run(
      `INSERT INTO race_checkpoint (race_id, checkpoint_position, checkpoint_name) VALUES
       (?, ?, ?);`
      , [race_id, checkpoint.position, checkpoint.name],
    );

    if (!checkpointResponse) throw new Error('Error creating checkpoint');
  }

  return race_id;
}

export async function getRace(request, reply) {
  const { id } = request.params;
  const { checkpoints, participants } = request.query;

  let response = {};

  const race = await db.get('SELECT * FROM race WHERE race_id = ?;', [id]);

  if (!race) throw new Error('Not found');

  response = {
    ...race,
  };

  if (checkpoints) {
    const race_checkpoint = await db.all('SELECT * FROM race_checkpoint WHERE race_id=?', [id]);

    response = {
      ...response,
      race_checkpoint,
    };
  }

  if (participants) {
    const race_participant = await db.all('SELECT * FROM race_participant WHERE race_id=?', [id]);
    response = {
      ...response,
      race_participant,
    };
  }

  return response;
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
  const { race_start_time, race_date } = request.body;

  const response = await db.run(`
    UPDATE race
    SET 
      race_start_time = ?,
      race_date = ?
    WHERE race_id = ?;
    `, [race_start_time, race_date, id]);

  if (!response) throw new Error('Not found');

  return { message: `Race started at: ${race_start_time}` };
}

export async function stopRace(request, reply) {
  const { id } = request.params;
  const { race_end_time, race_date } = request.body;

  const response = await db.run(`
    UPDATE race
    SET 
      race_end_time = ?,
      race_date = ?
    WHERE race_id = ?;
    `, [race_end_time, race_date, id]);

  if (!response) throw new Error('Not found');

  return { message: `Race stopped: ${race_end_time}` };
}


export async function deleteRace(request, reply) {
  const { id } = request.params;

  return { message: `Delete race ${id}` };
}

export async function raceCheckIn(request, reply) {
  const { id } = request.params;
  const { participant_id } = request.body;

  const existsResponse = await db.run(`
    SELECT 1
    FROM race_participant 
    WHERE 
      race_id = ? AND 
      participant_id = ?;`
    , [id, participant_id]);

  let checkInResponse;
  if (!existsResponse) {
    checkInResponse = await db.run(`INSERT INTO race_participant (race_id, participant_id, checked_in) VALUES (?, ?, TRUE);`, [id, participant_id]);
  } else {
    checkInResponse = await db.run(`
      UPDATE race_participant 
      SET checked_in = TRUE 
      WHERE 
        race_id = ? AND 
        participant_id = ?;`
      , [id, participant_id]);
  }

  if (!checkInResponse) throw new Error('Failed to check in.');

  return { message: `Participant ${participant_id} checked into race: ${id}` }
}

export async function raceCheckOut(request, reply) {
  const { id } = request.params;
  const { participant_id, finish_postion } = request.body;

  const existsResponse = await db.run(`
    SELECT 1
    FROM race_participant 
    WHERE 
      race_id = ? AND 
      participant_id = ?;`
    , [id, participant_id]);

  if (!existsResponse) throw new Error('Participant is not associated with this race.');

  const checkOutResponse = await db.run(`
    UPDATE race_participant 
    SET 
      finish_position = ?
    WHERE 
      race_id = ? AND 
      participant_id = ?;`
    , [finish_postion, id, participant_id]);

  if (!checkOutResponse) throw new Error('Failed to check out.');

  return { message: `Participant ${participant_id} checked out race: ${id} with the finish postion of: ${finish_postion}` }
}

export async function createRacePositions(request, reply) {
  const { id } = request.params;
  const { positions } = request.body;

  const promises = [];

  console.log(positions);

  for (let i = 0; i < positions.length; i++) {
    promises.push(db.run(`INSERT INTO race_position (race_id, finish_position, finish_time) VALUES (?, ?, ?);`, [id, i + 1, positions[i]]));
  }

  const response = await Promise.all(promises);

  if (!response || response.length !== positions.length) {
    throw new Error('Failed to record all finish positions.');
  }


  return response;
}

export async function getRacePositions(request, reply) {
  const { id } = request.params;

  const response = await db.all('SELECT * FROM race_position WHERE race_id = ?', [id]);

  if (!response) throw new Error(`Failed to values in race_position for race_id: ${id}`);

  return response;
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
    requiredParams: [
      'race_date',
      'race_name',
      'race_start_time',
      'postcode',
      'city',
      'checkpoints',
      'check_in_open_time',
      'address_line_1',
    ],
  },
  {
    method: 'GET',
    url: '/api/race/:id',
    handler: getRace,
    requiredParams: ['id'],
  },
  {
    method: 'PUT',
    url: '/api/race/:id/check-in',
    handler: raceCheckIn,
    requiredParams: ['id', 'participant_id'],
  },
  {
    method: 'PUT',
    url: '/api/race/:id/check-out',
    handler: raceCheckOut,
    requiredParams: ['id', 'participant_id', 'finish_position'],
  },
  {
    method: 'POST',
    url: '/api/race/:id/positions',
    handler: createRacePositions,
    requiredParams: ['id', 'positions']
  },
  {
    method: 'GET',
    url: '/api/race/:id/positions',
    handler: getRacePositions,
    requiredParams: ['id']
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
    requiredParams: ['id', 'race_start_time', 'race_date'],
  },
  {
    method: 'PATCH',
    url: '/api/race/:id/stop',
    handler: stopRace,
    requiredParams: ['id', 'race_end_time', 'race_date'],
  },
  {
    method: 'DELETE',
    url: '/api/race/:id',
    handler: deleteRace,
    requiredParams: ['id'],
  }
];
