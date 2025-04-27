import { getContent, loadInitialScreen } from "./lib/views.mjs";

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
    view: `organise/race`,
    title: 'Race'
  },
  {
    view: `organise/races`,
    title: 'My Races'
  },
  {
    view: `profile`,
    title: 'Profile'
  }
];

export const templates = {};

export const ui = {};

const user = () => localStorage.getItem('user') ?? null;

function getHandles() {
  ui.mainnav = document.querySelector('header > nav');
  ui.main = document.querySelector('main');
  ui.views = {};
  ui.getViews = () => Object.values(ui.views);
  ui.getButtons = () => Object.values(ui.buttons);
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

function setupNav() {
  ui.buttons = {};
  const nav = [
    { title: 'Home', view: 'home' },
    { title: 'Organise', view: 'organise' },
    { title: 'Profile', view: 'profile' },
  ]
  for (const item of nav) {
    const button = document.createElement('nav-button');
    button.setAttribute('view', item.view);
    button.textContent = item.title;

    ui.mainnav.appendChild(button);
    ui.buttons[item.view] = button;
  }
}

async function main() {
  getHandles();
  buildViews();
  setupNav();
  await getContent();
  window.addEventListener('popstate', loadInitialScreen);
  loadInitialScreen();
}

main();