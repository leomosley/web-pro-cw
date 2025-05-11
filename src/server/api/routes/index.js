import { participantRoutes } from './particpant.js';
import { raceRoutes } from './race.js';

export function createAPIRoute(app, { method, url, handler, requiredParams = [] }) {
  app.route({
    method,
    url,
    handler: async (req, reply) => {
      try {
        const params = req.params || {};
        const query = req.query || {};
        const body = req.body || {};

        for (const param of requiredParams) {
          if (!(param in params) && !(param in query) && !(param in body)) {
            return reply.status(400).send({ error: `Missing required parameter: ${param}` });
          }
        }

        const result = await handler({ ...req, params, query, body }, reply);
        reply.send(result);
      } catch (error) {
        app.log.error(error);
        reply.status(500).send({ error: 'Internal Server Error' });
      }
    },
  });
}

export const routes = [
  ...raceRoutes,
  ...participantRoutes,
];
