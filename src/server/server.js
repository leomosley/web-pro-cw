import Fastify from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import fastifyStatic from '@fastify/static';
import { createAPIRoute, createPageRoute } from '../lib/utils.js';
import { routes } from './api/routes/index.js';
import { db } from './db/index.js';

const PORT = 8080;

async function main() {
  const app = Fastify({
    logger: true,
  });

  // Register static files to be served from `public`
  app.register(fastifyStatic, {
    root: path.join(process.cwd(), 'src/client'),
    prefix: '/public/',
    index: false,
  });

  // 404 handler
  app.setNotFoundHandler(async (request, reply) => {
    reply.code(404);
    const pagePath = path.join('src', 'pages');
    const file = await fs.readFile(
      path.join(pagePath, 'not-found.html'),
      'utf-8',
    );
    reply.type('text/html').send(file);
  });

  /* Page Routes */

  // Organise routes
  createPageRoute(app, {
    url: '/',
  });

  createPageRoute(app, {
    url: '/organise',
  });

  createPageRoute(app, {
    url: '/organise/create',
  });

  createPageRoute(app, {
    url: '/organise/:id',
    handler: async (request, file) => {
      const { id } = request.params;

      const response = await db.get('SELECT * FROM race WHERE race_id=?', id);

      if (!response) throw new Error('Race doesnt exist');

      file = file.replace('{{id}}', id);
      file = file.replace('{{race_name}}', response.race_name);
      file = file.replace('{{race_date}}', response.race_date);
      file = file.replace('{{check_in_open_time}}', response.check_in_open_time);
      file = file.replace('{{race_start_time}}', response.race_start_time);

      file = file.replace('{{checkpoints}}', JSON.stringify(response.checkpoints));

      return file;
    }
  });

  createPageRoute(app, {
    url: '/organise/:id/check-in',
    handler: async (request, file) => {
      const { id } = request.params;

      const response = await db.get('SELECT * FROM race WHERE race_id=?', id);

      if (!response) throw new Error('Race doesnt exist');

      file = file.replace(/{{id}}/g, id);

      return file;
    }
  });

  createPageRoute(app, {
    url: '/organise/:id/check-out',
    handler: async (request, file) => {
      const { id } = request.params;

      const response = await db.get('SELECT * FROM race WHERE race_id=?', id);

      if (!response) throw new Error('Race doesnt exist');

      file = file.replace(/{{id}}/g, id);

      return file;
    }
  });

  // Participant routes
  createPageRoute(app, {
    url: '/participant',
  });

  createPageRoute(app, {
    url: '/participant/:id',
    handler: async (request, file) => {
      const { id } = request.params;

      const response = await db.get('SELECT * FROM participant WHERE participant_id=?', id);

      if (!response) throw new Error('Participant doesnt exist');

      file = file.replace(/{{id}}/g, id);

      return file;
    }
  });

  /* API ROUTES */
  for (const route of routes) {
    createAPIRoute(app, route);
  }

  try {
    await app.listen({ port: PORT }, (err, address) => {
      console.log(`Server listening ${address}`);
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();