import { db } from './db/index.js';

export async function organisePage(request, file) {
  const { id } = request.params;

  const response = await db.get('SELECT * FROM race WHERE race_id=?', id);

  if (!response) throw new Error('Race doesnt exist');

  file = file.replace(/{{id}}/g, id);
  file = file.replace(/{{race_name}}/g, response.race_name);
  file = file.replace(/{{race_date}}/g, response.race_date);
  file = file.replace(/{{check_in_open_time}}/g, response.check_in_open_time);
  file = file.replace(/{{race_start_time}}/g, response.race_start_time);
  file = file.replace(/{{checkpoints}}/g, JSON.stringify(response.checkpoints));

  return file;
}

export async function checkInPage(request, file) {
  const { id } = request.params;

  const response = await db.get('SELECT * FROM race WHERE race_id=?', id);

  if (!response) throw new Error('Race doesnt exist');

  file = file.replace(/{{id}}/g, id);

  return file;
}

export async function checkOutPage(request, file) {
  const { id } = request.params;

  const response = await db.get('SELECT * FROM race WHERE race_id=?', id);

  if (!response) throw new Error('Race doesnt exist');

  file = file.replace(/{{id}}/g, id);

  return file;
}

export async function participantPage(request, file) {
  const { id } = request.params;

  const response = await db.get('SELECT * FROM participant WHERE participant_id=?', id);

  if (!response) throw new Error('Participant doesnt exist');

  file = file.replace(/{{id}}/g, id);

  return file;
}

export const pages = [
  { url: '/' },
  { url: '/organise' },
  { url: '/organise/create' },
  {
    url: '/organise/:id',
    handler: organisePage,
  },
  {
    url: '/organise/:id/check-in',
    handler: checkInPage,
  },
  {
    url: '/organise/:id/check-out',
    handler: checkOutPage,
  },
  { url: '/participant' },
  { url: '/participant/create' },
  { url: '/participant/:id' },
];
