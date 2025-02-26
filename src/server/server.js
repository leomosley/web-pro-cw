// Import the framework and instantiate it
import Fastify from "fastify";
import { db } from "./db/index.js";
import path from 'path';
import fs from 'fs/promises';
import { createRoute } from "../lib/utils.js";
import fastifyStatic from "@fastify/static";
import { routes } from "./api/routes/index.js";

const PORT = 8080;

const app = Fastify({
  logger: true,
});

app.register(fastifyStatic, {
  root: path.join(process.cwd(), "src/client"),
  prefix: "/public/",
  index: false,
});

/* 
  Page Routes
*/

// Organise routes
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

  const pagesPath = path.join("src", "pages", "organise", "[id]", "index.html");
  let file = await fs.readFile(pagesPath, 'utf-8');


  file = file.replace("{{id}}", id);
  file = file.replace("{{race_name}}", response.race_name);
  file = file.replace("{{race_date}}", response.race_date);
  file = file.replace("{{check_in_open_time}}", response.check_in_open_time);
  file = file.replace("{{race_start_time}}", response.race_start_time);

  file = file.replace("{{checkpoints}}", JSON.stringify(response.checkpoints));

  reply.type('text/html').send(file);
});

app.get("/organise/:id/check-in", async (request, reply) => {
  const { id } = request.params;

  const response = await db.get("SELECT * FROM race WHERE race_id=?", id);

  if (!response) throw new Error("Race doesnt exist");

  const pagesPath = path.join("src", "pages", "organise", "[id]", "check-in", "index.html");
  let file = await fs.readFile(pagesPath, 'utf-8');


  file = file.replace(/{{id}}/g, id);

  reply.type('text/html').send(file);
});

// Participant routes
app.get("/participant", async (request, reply) => {
  const pagesPath = path.join("src", "pages", "participant");
  const file = await fs.readFile(path.join(pagesPath, "index.html"), "utf-8");

  reply.type('text/html').send(file);
});

app.get("/participant/:id", async (request, reply) => {
  const { id } = request.params;

  const response = await db.get("SELECT * FROM participant WHERE participant_id=?", id);

  if (!response) throw new Error("Participant doesnt exist");

  const pagesPath = path.join("src", "pages", "participant", "[id]", "index.html");
  let file = await fs.readFile(pagesPath, 'utf-8');


  file = file.replace(/{{id}}/g, id);

  reply.type('text/html').send(file);
});

/* API ROUTES */
for (const route of routes) {
  createRoute(app, route);
}

try {
  app.listen({ port: PORT }, (err, address) => {
    console.log(`Server listening ${address}`);
  });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}