import { ui } from '../index.mjs';
import { userStore } from '../lib/auth.mjs';

class NavBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.user = null;

    this.handleUserChange = this.handleUserChange.bind(this);

  }

  connectedCallback() {
    this.user = userStore.get();
    this.render();

    this.unsubscribe = userStore.watch(this.handleUserChange);
  }

  disconnectdCallback() {
    if (this.unsubscribe) this.unsubscribe();
  }

  handleUserChange(newUserValue) {
    this.user = newUserValue;
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <nav>
        <ul>
        </ul>
      </nav >
  `;

    const nav = [
      { label: 'Home', view: 'home' },
    ];

    if (!this.user) {
      nav.push({ label: 'Sign In', view: 'sign-in' });
    }

    switch (this.user?.role) {
      case 'participant':
        nav.push({ label: 'Participant Page', view: 'participant' });
        break;
      case 'organiser':
        nav.push({ label: 'Organise', view: 'organise' });
        break;
      case 'viewer':
        nav.push({ label: 'View', view: 'viewer' });
        break;
      case 'volunteer':
        nav.push({ label: 'Volunteer', view: 'volunteer' });
        break;
      default:
        break;
    }

    if (this.user) {
      nav.push({ label: 'Profile', view: 'profile' });
    }

    const navList = this.shadowRoot.querySelector('ul');
    for (const item of nav) {
      const listItem = document.createElement('li');
      const navButton = document.createElement('nav-button');

      navButton.setAttribute('view', item.view);
      navButton.textContent = item.label;

      listItem.append(navButton);
      navList.append(listItem);

      ui.buttons[item.view] = navButton;
    }

    this.shadowRoot.append(navList);
  }
}

customElements.define('nav-bar', NavBar);
