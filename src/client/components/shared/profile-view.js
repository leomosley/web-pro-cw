import { userStore } from '../../lib/auth.mjs';
import { localStore } from '../../lib/localStore.mjs';

class ProfileView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.user = null;

    this.handleUserChange = this.handleUserChange.bind(this);
  }

  connectedCallback() {
    this.user = userStore.get();
    this.render();

    this.subscribe = userStore.watch(this.handleUserChange);
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
  }

  handleUserChange(newUserValue) {
    this.user = newUserValue;
    this.render();
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
