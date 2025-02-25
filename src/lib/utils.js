export function generateRandomId() {
  // Generate a random uppercase letter (A-Z)
  const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 65);

  // Generate 4 random digits (0-9)
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // Ensures 4 digits

  // Combine the letter and digits
  return randomChar + randomDigits;
}

export function createRoute(app, { method, url, handler, requiredParams = [] }) {
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
