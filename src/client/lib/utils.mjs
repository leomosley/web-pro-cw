import { localStore } from './localStore.mjs';

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

export async function fetchWrapper(url) {
  const localStorageKey = `fetchFallback_${url}`; // Unique key for localStorage

  try {
    const apiResponse = await fetch(url);

    if (!apiResponse.ok) {
      throw new Error(`API request failed with status ${apiResponse.status}`);
    }

    const apiData = await apiResponse.json();

    try {
      localStorage.setItem(localStorageKey, JSON.stringify(apiData));
    } catch (localStorageError) {
      console.warn(
        "fetchWithFallback: Could not save data to localStorage:",
        localStorageError
      );
    }

    return apiData;
  } catch (apiError) {
    console.error("fetchWithFallback: API request failed:", apiError);

    console.log(
      `fetchWithFallback: Attempting to retrieve data from localStorage for ${url}`
    );
    const localStorageData = localStorage.getItem(localStorageKey);

    if (localStorageData) {
      try {
        return JSON.parse(localStorageData);
      } catch (parseError) {
        console.error(
          "fetchWithFallback: Failed to parse data from localStorage:",
          parseError
        );
        throw new Error(
          `Failed to fetch data from API and failed to parse data from localStorage for ${url}`
        );
      }
    } else {
      console.warn(`fetchWithFallback: No data found in localStorage for ${url}`);
      throw new Error(`Failed to fetch data from API and no data found in localStorage for ${url}`);
    }
  }
}
