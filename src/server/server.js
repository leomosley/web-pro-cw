// Import the framework and instantiate it
import Fastify from "fastify";
import { db } from "./db/index.js";
import path from 'path';
import fs from 'fs/promises';

const PORT = 8080;

const app = Fastify({
  logger: true,
});

/* 
  Page Routes
*/
app.get("/", async (request, reply) => {
  const pagesPath = path.join("src", "pages");
  const file = await fs.readFile(path.join(pagesPath, "index.html"), "utf-8");

  reply.type('text/html').send(file);
});

app.get("/organise", async (request, reply) => {
  const pagesPath = path.join("src", "pages", "organise");
  const file = await fs.readFile(path.join(pagesPath, "index.html"), "utf-8");

  reply.type('text/html').send(file);
});

app.get("/organise/create", async (request, reply) => {
  const pagesPath = path.join("src", "pages", "organise", "create");
  const file = await fs.readFile(path.join(pagesPath, "index.html"), "utf-8");

  reply.type('text/html').send(file);
});

app.get("/organise/:id", async (request, reply) => {
  const { id } = request.params;

  const response = await db.get("SELECT * FROM race WHERE race_id=?", id);

  if (!response) throw new Error("Race doesnt exist");

  const pagesPath = path.join("src", "pages", "organise", "[id]");
  let file = await fs.readFile(path.join(pagesPath, "index.html"), "utf-8");

  file = file.replace("{{id}}", id);
  file = file.replace("{{race_name}}", response.race_name);
  file = file.replace("{{race_date}}", response.race_date);
  file = file.replace("{{check_in_open_time}}", response.check_in_open_time);
  file = file.replace("{{race_start_time}}", response.race_start_time);

  file = file.replace("{{checkpoints}}", response.checkpoints);

  reply.type('text/html').send(file);
});


/* 
  API ROUTES
*/

// RACE ROUTES
app.get("/api/race", async (request, reply) => {
  return await db.all("SELECT * FROM race;");
});

app.post("/api/race", async (request, reply) => {
  try {
    const { location_id, race_name, race_date, check_in_open_time, race_start_time } = request.body;

    if (!location_id || !race_name || !race_date || !check_in_open_time || !race_start_time) {
      throw new Error("Missing required parameter.");
    }

    const response = await db.run(
      `INSERT INTO race (location_id, race_name, race_date, check_in_open_time, race_start_time) 
      VALUES 
        (?, ?, ?, ?, ?);`
      , [location_id, race_name, race_date, check_in_open_time, race_start_time]);

    if (!response) throw new Error("Error");

    return response;

  } catch (error) {
    reply.code(500);
    return { message: `Error creating race: ${error}` };
  }
});

app.get("/api/race/:id", async (request, reply) => {
  const { id } = request.params;

  if (!id) {
    // Set status code to `Unprocessable Entity`
    reply.code(422);
    return { message: "No `id` parameter supplied." }
  }

  try {
    const raceResponse = await db.get("SELECT * FROM race WHERE race_id = ?;", [id]);

    if (!raceResponse) throw new Error("Not found");

    const locationResponse = await db.get("SELECT * FROM location WHERE location_id=?", [raceResponse.location_id]);

    const checkpointsResponse = await db.all("SELECT * FROM checkpoint AS c JOIN race_checkpoint AS rc ON c.checkpoint_id = rc.checkpoint_id WHERE rc.race_id=?", [id]);

    return {
      ...raceResponse,
      location: locationResponse,
      checkpoints: checkpointsResponse
    };

  } catch (error) {
    reply.code(404);
    return { message: `No values for race_id=${id} found.` };
  }
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
  return await db.all("SELECT * FROM participant;");
});

app.post("/api/participant", async (request, reply) => {
  return await db.run("INSERT INTO participant DEFAULT VALUES;");
});

app.delete("/api/particpant/:id", async (request, reply) => {
  const { id } = request.params;

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