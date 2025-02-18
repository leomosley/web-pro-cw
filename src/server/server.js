// Import the framework and instantiate it
import Fastify from "fastify";

const app = Fastify({
  logger: true
});


// Declare a route
app.get("/api/hello", async function handler(request, reply) {
  return { hello: 'world' }
});

// Run server
const PORT = 8080;
try {
  await app.listen({ port: PORT }, (err, address) => {
    console.log(`Server running on ${address}`);
  })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}