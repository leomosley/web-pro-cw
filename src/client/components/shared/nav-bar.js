import { templates } from '../../index.mjs';
import { userStore } from '../../lib/auth.mjs';
import { readPath } from '../../lib/views.mjs';

// https://lucide.dev/icons/
const homeIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-house-icon lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
const profileIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-user-icon lucide-circle-user"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>';
const viewIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>';
const volunteerIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-helping-icon lucide-hand-helping"><path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14"/><path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 13 6 6"/></svg>';
const organiserIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-helping-icon lucide-hand-helping"><path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14"/><path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 13 6 6"/></svg>';
const participantIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-helping-icon lucide-hand-helping"><path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14"/><path d="m7 18 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 13 6 6"/></svg>';
const loginIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in-icon lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>';

class NavBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.append(templates.navbar.content.cloneNode(true));

    this.user = null;
    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleLocationChange = this.handleLocationChange.bind(this);
    this.navButtons = [];
  }

  connectedCallback() {
    this.user = userStore.get();
    this.render();
    this.updateActiveButton();
    this.unsubscribe = userStore.watch(this.handleUserChange);
    window.addEventListener('popstate', this.handleLocationChange);
    window.addEventListener('view-changed', this.handleLocationChange);
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    window.removeEventListener('popstate', this.handleLocationChange);
    window.removeEventListener('view-changed', this.handleLocationChange);
  }

  handleUserChange(newUserValue) {
    this.user = newUserValue;
    this.render();
    this.updateActiveButton();
  }

  handleLocationChange() {
    this.updateActiveButton();
  }

  generateNav() {
    const nav = [{ label: 'Home', view: 'home', icon: homeIcon }];

    if (!this.user) {
      nav.push({ label: 'Sign In', view: 'sign-in', icon: loginIcon });
    }

    switch (this.user?.role) {
      case 'participant': nav.push({ label: 'Participant Page', view: 'participant', icon: participantIcon }); break;
      case 'organiser': nav.push({ label: 'Organise', view: 'organise', icon: organiserIcon }); break;
      case 'viewer': nav.push({ label: 'View', view: 'viewer', icon: viewIcon }); break;
      case 'volunteer': nav.push({ label: 'Volunteer', view: 'volunteer', icon: volunteerIcon }); break;
    }

    if (this.user) {
      nav.push({ label: 'Profile', view: 'profile', icon: profileIcon });
    }

    return nav;
  }

  render() {
    const nav = this.generateNav();
    const navbar = this.shadowRoot.querySelector('.navbar');
    this.navButtons = [];
    navbar.innerHTML = '';

    for (const item of nav) {
      const navButton = document.createElement('nav-button');
      navButton.textContent = item.label;
      navButton.innerHTML += item.icon;
      navButton.setAttribute('view', item.view);

      this.navButtons.push(navButton);
      navbar.append(navButton);
    }
  }

  updateActiveButton() {
    const currentPath = readPath();

    for (const button of this.navButtons) {
      const buttonView = button.getAttribute('view');
      if (currentPath.startsWith(buttonView)) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    }
  }
}

customElements.define('nav-bar', NavBar);