import { db } from '../../db/index.js';

export const raceRoutes = [
  {
    method: 'GET',
    url: '/api/race',
    handler: async (request, reply) => {
      return await db.all('SELECT * FROM race;');
    },
  },
  {
    method: 'POST',
    url: '/api/race',
    handler: async (request, reply) => {
      const { location_id, race_name, race_date, check_in_open_time, race_start_time } = request.body;

      const response = await db.run(
        `INSERT INTO race (location_id, race_name, race_date, check_in_open_time, race_start_time) VALUES 
        (?, ?, ?, ?, ?);`
        , [location_id, race_name, race_date, check_in_open_time, race_start_time]);


      if (!response) throw new Error('Error');

      return response;
    },
    requiredParams: ['location_id', 'race_name', 'race_date', 'check_in_open_time', 'race_start_time'],
  },
  {
    method: 'GET',
    url: '/api/race/:id',
    handler: async (request, reply) => {
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
    },
    requiredParams: ['id'],
  },
  {
    method: 'PATCH',
    url: '/api/race/:id/check-in',
    handler: async (request, reply) => {
      const { id } = request.params;
      const { participant_id } = request.body;

      const response = await db.run(`
        UPDATE race_participant
        SET checked_in = TRUE
        WHERE race_id = ? AND participant_id = ?;
        `, [id, participant_id]);

      if (!response) throw new Error('Not found');

      return response;
    },
    requiredParams: ['id', 'participant_id'],
  },
  {
    method: 'PATCH',
    url: '/api/race/:id',
    handler: async (request, reply) => {
      const { id } = request.params;
      const body = request.body;

      return { message: `Update race ${id}` };
    },
    requiredParams: ['id'],
  },
  {
    method: 'DELETE',
    url: '/api/race/:id',
    handler: async (request, reply) => {
      const { id } = request.params;
      const body = request.body;

      return { message: `Delete race ${id}` };
    },
    requiredParams: ['id'],
  },
];
