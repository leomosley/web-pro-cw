import { getUser } from '../app.mjs';
import { localStore } from '../lib/localstore.mjs';

class ProfileView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.user = null;

    this.handleUserChange = this.handleUserChange.bind(this);
  }

  connectedCallback() {
    this.user = getUser();
    this.render();

    localStore.addEventListener('localStoreChange', this.handleUserChange);
  }

  disconnectedCallback() {
    localStore.removeEventListener('localStoreChange', this.handleUserChange);
  }

  handleUserChange(event) {
    if (event.detail.key === 'user') {
      this.user = event.detail.newValue;

      this.render();

    }
  }

  render() {
    this.shadowRoot.innerHTML = '';

    const button = document.createElement('nav-button');

    if (!this.user) {
      button.setAttribute('view', 'sign-in');
      button.textContent = 'Sign In';

    } else {
      button.setAttribute('view', 'sign-out');
      button.textContent = 'Sign Out';

    }

    this.shadowRoot.appendChild(button);
  }
}

customElements.define('profile-view', ProfileView);
