import path from 'path';
import fs from 'fs/promises';

export function generateRandomId() {
  // Generate a random uppercase letter (A-Z)
  const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 65);

  // Generate 4 random digits (0-9)
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // Ensures 4 digits

  // Combine the letter and digits
  return randomChar + randomDigits;
}

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

export function createPageRoute(app, { url, handler }) {
  const paramMatches = [...url.matchAll(/:(\w+)/g)];
  const requiredParams = paramMatches.map(match => match[1]);
  const filePath = path.join('src', 'pages', ...url.split('/').map(segment => (segment.startsWith(':') ? `[${segment.slice(1)}]` : segment)), 'index.html');

  app.route({
    method: 'GET',
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

        let file = await fs.readFile(filePath, 'utf-8');
        if (handler) file = await handler({ ...req, params, query, body }, file);

        reply.type('text/html').send(file);

      } catch (error) {
        app.log.error(error);
        let file = await fs.readFile('src/pages/global-error.html', 'utf-8');

        reply.type('text/html').send(file);
      }
    },
  });
}