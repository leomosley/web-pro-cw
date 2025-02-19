// Import the framework and instantiate it
import Fastify from "fastify";
import { db } from "./db/index.js";

const PORT = 8080;

const app = Fastify({
  logger: true,
});

// RACE ROUTES
app.get("/api/race", async (request, reply) => {
  return { message: "Get all races" };
});

app.post("/api/race", async (request, reply) => {
  const post = request.body;
  return { message: "Create a race", data: post };
});

app.get("/api/race/:id", async (request, reply) => {
  const { id } = request.params;

  // Set status code to `Unprocessable Entity`
  reply.code(422);
  if (!id) return { message: "No `id` parameter supplied." }

  return { message: `Get race ${id}` };
});

app.patch("/api/race/:id", async (request, reply) => {
  const { id } = request.params;
  const body = request.body;

  if (!id) {
    // Set status code to `Unprocessable Entity`
    reply.code(422);
    return { message: "No `id` parameter supplied." }
  }

  if (!body) {
    // Set status code to `Unprocessable Entity`
    reply.code(422);
    return { message: "No request body supplied." }
  }

  return { message: `Update race ${id}` };
});

app.delete("/api/race/:id", async (request, reply) => {
  const { id } = request.params;
  const body = request.body;

  if (!id) {
    // Set status code to `Unprocessable Entity`
    reply.code(422);
    return { message: "No `id` parameter supplied." }
  }

  return { message: `Delete race ${id}` };
});

// PARTICIPANT ROUTES
app.get("/api/participant", async (request, reply) => {
  return { message: "Get all particpants" };
});

app.post("/api/participant", async (request, reply) => {
  const post = request.body;
  return { message: "Create a particpant", data: post };
});

app.delete("/api/particpant/:id", async (request, reply) => {
  const { id } = request.params;
  const body = request.body;

  if (!id) {
    // Set status code to `Unprocessable Entity`
    reply.code(422);
    return { message: "No `id` parameter supplied." }
  }

  return { message: `Delete race ${id}` };
});

try {
  await app.listen({ port: PORT }, (err, address) => {
    console.log(`Server listening ${address}`);
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}