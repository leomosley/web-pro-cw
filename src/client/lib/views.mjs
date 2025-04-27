import { ui, pages } from "../app.mjs";

// Show a specific element
export function showElement(e) {
  e.classList.remove('hidden');
}

// Hide a specific element
export function hideElement(e) {
  e.classList.add('hidden');
}

// Show a specific view based on event
export function show(event) {
  ui.previous = ui.current;
  const view = event?.target?.dataset?.view ?? 'home';

  showView(view);
}


// Hide all views
export function hideAllViews() {
  for (const view of ui.getViews()) {
    hideElement(view);
  }
}

// Enable all buttons
export function enableAllButtons() {
  for (const button of ui.getButtons()) {
    button.removeAttribute('disabled');
  }
}

// Read the current path from the URL
export function readPath() {
  let path = window.location.pathname;

  // Remove trailing slash
  if (path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  // Use regex to remove search parameters and hash fragments
  const basePath = path.replace(/[?|&#].*$/, "");

  // Remove the initial "/app/"
  const cleanedPath = basePath.slice(5);

  return cleanedPath === "" ? "home" : cleanedPath;
}

// Load the content for a specific view
export async function loadView(view) {
  const url = `/views/${view}.inc`;
  const response = await fetch(url);
  if (response.ok) {
    return await response.text();
  } else {
    return `sorry, a ${response.status} error occurred retrieving section data for: <code>${url}</code>`;
  }
}

//  Store the app's state in the History API to allow the back button to work
export function storeState() {
  history.pushState(ui.current, ui.current, `/app/${ui.current}`);
}

// Show the current view based on the name
export function showView(name) {
  hideAllViews();
  enableAllButtons();

  console.log('showView', name);
  if (!ui.views[name]) {
    name = 'error';
  }

  showElement(ui.views[name]);

  ui.current = name;
  const page = pages.find((page) => page.view === name);
  document.title = page ? page.title : 'Error';

  if (name === 'error') {
    return;
  }

  if (ui.buttons[name]) {
    ui.buttons[name].disabled = 'disabled';
  }
}

export function loadInitialScreen() {
  ui.current = readPath();
  showView(ui.current);
}

export async function getContent() {
  for (const page of pages) {
    const content = await loadView(page.view);
    const article = document.createElement('article');
    article.innerHTML = content;
    ui.views[page.view].append(article);
  }
}