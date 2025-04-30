import { getContent, loadInitialView } from "./lib/views.mjs";
import { localStore } from "./lib/localStore.mjs";

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
  }
];

export const templates = {};

export const ui = {};

export const getUser = () => localStore.getItem('user') ?? null;

function getHandles() {
  ui.mainnav = document.querySelector('header > nav-bar');
  ui.main = document.querySelector('main');
  ui.views = {};
  ui.buttons = {};
  ui.getViews = () => Object.values(ui.views ?? {});
  ui.getButtons = () => Object.values(ui.buttons ?? {});
  templates.view = document.querySelector('#tmp-view');
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