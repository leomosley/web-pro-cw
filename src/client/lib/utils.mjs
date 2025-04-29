import { localStore } from "./localStore.mjs";

export function formatTime(milliseconds) {
  const isNegative = milliseconds < 0;
  milliseconds = Math.abs(milliseconds);

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedTime = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');

  return isNegative ? `-${formattedTime}` : formattedTime;
}

export function calculateElapsedTime(startTime, endTime) {
  const elapsed = endTime - startTime;

  return formatTime(elapsed);
}

export function generateRandomId() {
  const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return randomChar + randomDigits;
}

export function toBinaryString(string) {
  return string.split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

export function getRaceById(raceId) {
  const races = localStore.getItem('race') ?? [];
  const filtred = races.filter((race) => race.race_id === Number(raceId));
  return filtred[0] ?? null;
}