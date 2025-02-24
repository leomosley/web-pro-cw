import { participantRoutes } from "./particpant.js";
import { raceRoutes } from "./race.js";

export const routes = [
  ...raceRoutes,
  ...participantRoutes
];