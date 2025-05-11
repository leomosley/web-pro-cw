import { userStore } from "../lib/auth.mjs";

export const protectedViews = [
  'home',
  'participant',
  'settings',
];

export const hiddenWhenAuthedViews = [
  'sign-in',
  'sign-up',
];

export function authenticate(view) {
  const isAuthenticated = userStore.get();

  for (const path of protectedViews) {
    if (view.startsWith(path)) {
      if (!isAuthenticated) {
        return 'sign-in';
      }
    }
  }

  for (const path of hiddenWhenAuthedViews) {
    if (view.startsWith(path)) {
      if (isAuthenticated) {
        return 'home';
      }
    }
  }

  return view;
}

export const middleware = [
  authenticate,
];
