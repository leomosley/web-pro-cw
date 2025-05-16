import { getContent, loadInitialView } from "./lib/views.mjs";

// https://lucide.dev/icons/
export const icons = {
  home: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house-icon lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  profile: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-user-icon lucide-circle-user"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>',
  view: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>',
  organiser: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-pen-icon lucide-clipboard-pen"><rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5.5"/><path d="M4 13.5V6a2 2 0 0 1 2-2h2"/><path d="M13.378 15.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></svg>',
  volunteer: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-helping-icon lucide-hand-helping"><path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14"/><path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 13 6 6"/></svg>',
  participant: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-snail-icon lucide-snail"><path d="M2 13a6 6 0 1 0 12 0 4 4 0 1 0-8 0 2 2 0 0 0 4 0"/><circle cx="10" cy="13" r="8"/><path d="M2 21h12c4.4 0 8-3.6 8-8V7a2 2 0 1 0-4 0v6"/><path d="M18 3 19.1 5.2"/><path d="M22 3 20.9 5.2"/></svg>',
  login: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in-icon lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>',
}

export const pages = [
  {
    view: 'home',
    title: 'Home'
  },
  {
    view: 'organise',
    title: 'Organise'
  },
  {
    view: 'participant',
    title: 'Participant'
  },
  {
    view: 'organise/create',
    title: 'Create a Race'
  },
  {
    view: 'organise/race',
    title: 'Race'
  },
  {
    view: 'organise/races',
    title: 'My Races'
  },
  {
    view: 'profile',
    title: 'Profile'
  },
  {
    view: 'sign-in',
    title: 'Sign In'
  },
  {
    view: 'sign-up',
    title: 'Sign Up'
  },
  {
    view: 'sign-out',
    title: 'Sign Out'
  },
  {
    view: 'onboarding',
    title: 'Onboarding'
  },
  {
    view: 'volunteer',
    title: 'Volunteer'
  },
  {
    view: 'view',
    title: 'Viewer'
  },
  {
    view: 'race/results',
    title: 'Race Results'
  }
];

export const templates = {};

export const ui = {};

function getHandles() {
  ui.mainnav = document.querySelector('header > nav-bar');
  ui.main = document.querySelector('main');
  ui.views = {};
  ui.buttons = {};
  ui.getViews = () => Object.values(ui.views ?? {});
  ui.getButtons = () => Object.values(ui.buttons ?? {});
  templates.view = document.querySelector('#tmp-view');
  templates.navbar = document.querySelector('#tmp-nav-bar');
  templates.participantView = document.querySelector('#tmp-participant-view');
  templates.raceListItem = document.querySelector('#tmp-race-list-item');
  templates.createRaceForm = document.querySelector('#tmp-create-race-form');
  templates.selectRole = document.querySelector('#tmp-select-role');
  templates.profileView = document.querySelector('#tmp-profile-view');
  templates.signOutButton = document.querySelector('#tmp-sign-out-button');
  templates.signOutView = document.querySelector('#tmp-sign-out-view');
  templates.onboardingView = document.querySelector('#tmp-onboarding-view');
  templates.signUpView = document.querySelector('#tmp-sign-up-view');
  templates.signInView = document.querySelector('#tmp-sign-in-view');
  templates.homeView = document.querySelector('#tmp-home-view');
  templates.roleItem = document.querySelector('#tmp-role-item');
  templates.favoritedRoleItem = document.querySelector('#tmp-favorited-role-item');
  templates.raceDashboard = document.querySelector('#tmp-race-dashboard');
  templates.raceDashboardNotFound = document.querySelector('#tmp-race-dashboard-not-found');
  templates.volunteerView = document.querySelector('#tmp-volunteer-view');
  templates.raceResults = document.querySelector('#tmp-race-results');
  templates.viewerView = document.querySelector('#tmp-viewer-view');
}

// Build views based on pages
function buildViews() {
  const template = templates.view;
  for (const page of pages) {
    const section = template.content.cloneNode(true).firstElementChild;

    section.dataset.id = `sect-${page.view}`;
    section.dataset.name = page.view;

    ui.main.append(section);
    ui.views[page.view] = section;

  }
}

async function main() {
  getHandles();
  buildViews();
  await getContent();
  window.addEventListener('popstate', loadInitialView);
  loadInitialView();
}

main();