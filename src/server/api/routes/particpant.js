import { db } from "../../db/index.js";

export const participantRoutes = [
  {
    method: "GET",
    url: "/api/participant",
    handler: async (request, reply) => {
      return await db.all("SELECT * FROM participant;");
    },
  },
  {
    method: "POST",
    url: "/api/participant",
    handler: async (request, reply) => {
      while (true) {
        const id = generateRandomId();

        const exists = await db.get("SELECT * FROM participant WHERE participant_id=?;", id);

        if (!exists) {
          await db.run("INSERT INTO participant (participant_id) VALUES (?);", id);

          return { id };
        }
      }
    },
  },
  {
    method: "DELETE",
    url: "/api/participant/:id",
    handler: async (request, reply) => {
      const { id } = request.params;

      return { message: `Delete race ${id}` };
    },
  },
];