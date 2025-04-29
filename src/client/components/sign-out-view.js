import { getUser } from '../app.mjs';
import { localStore } from '../lib/localstore.mjs';
import { navigate, readPath } from '../lib/views.mjs';

class SignOutView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.user = null;

    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  connectedCallback() {
    this.user = getUser();
    const currentPath = readPath();

    if (!!this.user && currentPath === 'sign-out') {
      return navigate('home');
    }

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

      const currentPath = readPath();
      if (!this.user && currentPath === 'sign-out') {
        navigate('home');
      }
    }
  }

  handleSignOut(event) {
    localStore.setItem('user', null);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <h1>Sign Out</h1>
      <p>Are you sure you want to sign out?</p>
    `;

    const button = document.createElement('button');
    button.addEventListener('click', this.handleSignOut.bind(this));
    button.textContent = 'Sign Out';

    this.shadowRoot.appendChild(button);
  }
}

customElements.define('sign-out-view', SignOutView);
