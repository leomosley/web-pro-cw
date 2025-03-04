import Fastify from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import fastifyStatic from '@fastify/static';
import { createAPIRoute, createPageRoute } from '../lib/utils.js';
import { routes } from './api/routes/index.js';
import { pages } from './pages.js';

export const PORT = 8080;

export const app = Fastify({
  logger: true,
});

async function main() {
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
  for (const page of pages) {
    createPageRoute(app, page);
  }

  /* API Routes */
  for (const route of routes) {
    createAPIRoute(app, route);
  }

  // Start the server
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
