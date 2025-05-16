import { localStore } from './localStore.mjs';

export function formatTime(milliseconds, includeMilliseconds = false) {
  const isNegative = milliseconds < 0;
  milliseconds = Math.abs(milliseconds);

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const remainingMilliseconds = milliseconds % 1000;

  let formattedTime = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');

  if (includeMilliseconds) {
    formattedTime += `:${remainingMilliseconds.toString().padStart(3, '0')}`;
  }

  return isNegative ? `-${formattedTime}` : formattedTime;
}


export function calculateElapsedTime(startTime, endTime, milliseconds = false) {
  const elapsed = endTime - startTime;

  return formatTime(elapsed, milliseconds);
}

export function convertTimeToTimestamp(timeStr) {
  if (!timeStr) {
    return null;
  }


  const [hours, minutes, seconds] = timeStr.split(':').map(Number);

  const date = new Date();
  date.setHours(hours ?? 0, minutes ?? 0, seconds ?? 0, 0);
  return date.getTime();
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

export async function getRaceById(raceId, checkpoints = false, participants = false) {
  try {
    if (!raceId || raceId.length < 5) {
      throw new Error("Please provide a valid raceId");
    }

    let url = `/api/race/${raceId}?`;

    if (checkpoints) {
      url += `&checkpoints=${checkpoints}`
    }

    if (participants) {
      url += `&participants=${participants}`
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching race: ${response.status}`);
    }

    const race = await response.json();

    return {
      success: true,
      race,
      error: null
    }
  } catch (error) {
    return {
      success: false,
      race: null,
      error: String(error)
    }
  }
}

export async function getAllRaces(checkpoints = false, participants = false) {
  try {
    let url = `/api/race`;

    if (checkpoints) {
      url += `&checkpoints=${checkpoints}`
    }

    if (participants) {
      url += `&participants=${participants}`
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching race: ${response.status}`);
    }

    const races = await response.json();

    return {
      success: true,
      races,
      error: null
    }
  } catch (error) {
    return {
      success: false,
      races: null,
      error: String(error)
    }
  }
}

export async function getRacePositions(raceId) {
  try {
    if (!raceId) {
      throw new Error("raceId not supplied");
    }

    let url = `/api/race/${raceId}/positions`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching race: ${response.status}`);
    }

    const positions = await response.json();

    return {
      success: true,
      positions,
      error: null
    }
  } catch (error) {
    return {
      success: false,
      positions: null,
      error: String(error)
    }
  }
}


export async function getRaceParticipants(raceId) {
  try {
    if (!raceId) {
      throw new Error("raceId not supplied");
    }

    let url = `/api/race/${raceId}/participants`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching race: ${response.status}`);
    }

    const participants = await response.json();

    return {
      success: true,
      participants,
      error: null
    }
  } catch (error) {
    return {
      success: false,
      participants: null,
      error: String(error)
    }
  }
}

export async function getRaceResults(raceId) {
  const [participantsRes, positionsRes] = await Promise.all([
    getRaceParticipants(raceId),
    getRacePositions(raceId)
  ]);

  if (!participantsRes.success || !positionsRes.success) {
    return {
      success: false,
      results: null,
      error: participantsRes.error || positionsRes.error
    };
  }

  const participantPositions = new Map();
  for (const participant of participantsRes.participants) {
    if (participant.finish_position) {
      participantPositions.set(participant.finish_position, participant.participant_id);
    }
  }


  let combined = positionsRes.positions.map(p => ({
    ...p,
    participant_id: participantPositions.get(p.finish_position) ?? null
  }));

  return {
    success: true,
    results: combined,
    error: null
  };
}

export async function getAllParticipantsRaces(participantId, checkpoints = false, participants = false) {
  try {
    let url = `/api/participant/${participantId}/races`;

    if (checkpoints) {
      url += `&checkpoints=${checkpoints}`
    }

    if (participants) {
      url += `&participants=${participants}`
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error fetching race: ${response.status}`);
    }

    const races = await response.json();

    return {
      success: true,
      races,
      error: null
    }
  } catch (error) {
    return {
      success: false,
      races: null,
      error: String(error)
    }
  }
}

export function setUserRole(role) {
  const roleOptions = [
    'participant',
    'volunteer',
    'organiser',
    ''
  ];

  if (!roleOptions.includes(role)) {
    throw new Error(`${role} is not a valid option from: ${roleOptions.join(', ')}`)
  }

  const prev = localStore.getItem('user');
  localStore.setItem('user', {
    ...prev,
    role
  });

  return {
    oldValue: prev.role,
    nevValue: role
  }
}

export function setUserOnboarded(onboarded) {
  if (typeof onboarded !== "boolean") {
    throw new Error(`${onboarded} is not assignable to typeof 'boolean'`);
  }

  const prev = localStore.getItem('user');
  localStore.setItem('user', {
    ...prev,
    onboarded
  });

  return {
    oldValue: prev.onboarded,
    newValue: onboarded
  }
}