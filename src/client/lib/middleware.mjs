import { userStore } from "../lib/auth.mjs";

export const safeViews = [
  'sign-in',
  'sign-up',
  'view'
];

export const hiddenWhenAuthedViews = [
  'sign-in',
  'sign-up',
];

export function authenticate(view) {
  const isAuthenticated = userStore.get();

  if (isAuthenticated) {
    for (const path of hiddenWhenAuthedViews) {
      if (view.startsWith(path)) {
        return 'home';
      }
    }
  }

  if (!isAuthenticated) {
    let safePath = false;

    for (const path of safeViews) {
      if (view.startsWith(path)) {
        safePath = true;
      }
    }

    if (!safePath) {
      return 'sign-in';
    }
  }

  return view;
}

export const middleware = [
  authenticate,
];
