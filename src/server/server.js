import Fastify from 'fastify';
import url from 'url';
import fastifyStatic from '@fastify/static';
import path from 'path';

// Sets root dirname to start at `src`
const __dirname = url.fileURLToPath(new URL('..', import.meta.url));

export const PORT = 8080;

export const app = Fastify({
  logger: true,
});

async function main() {
  // Register static files
  await app.register(fastifyStatic, {
    root: path.join(__dirname, 'client'),
  });

  app.get('/api/*', async (request, reply) => {
    return { message: 'API route' };
  });

  app.get('/', async (request, reply) => {
    return reply.redirect('/app/');
  });

  app.get('/app', async (request, reply) => {
    return reply.redirect('/app/');
  });

  app.get('/app/*', async (request, reply) => {
    return reply.sendFile('index.html');
  });

  // Start the server
  try {
    app.listen({ port: PORT }, (err, address) => {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }
      console.log(`Server listening ${address}`);
    });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
