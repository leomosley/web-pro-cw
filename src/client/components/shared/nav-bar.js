import { icons, templates } from '../../index.mjs';
import { userStore } from '../../lib/auth.mjs';
import { readPath } from '../../lib/views.mjs';

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
    const nav = [{ label: 'Home', view: 'home', icon: icons.home }];


    switch (this.user?.role) {
      case 'organiser': nav.push({ label: 'Organise', view: 'organise', icon: icons.organiser }); break;
      case 'viewer': nav.push({ label: 'View', view: 'viewer', icon: icons.view }); break;
      case 'volunteer': nav.push({ label: 'Volunteer', view: 'volunteer', icon: icons.volunteer }); break;
      default: nav.push({ label: 'Participant', view: 'participant', icon: icons.participant }); break;
    }

    if (!this.user) {
      nav.push({ label: 'Sign In', view: 'sign-in', icon: icons.login });
    }

    if (this.user) {
      nav.push({ label: 'Profile', view: 'profile', icon: icons.profile });
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
