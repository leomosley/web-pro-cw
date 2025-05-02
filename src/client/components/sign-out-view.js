import { userStore } from '../lib/auth.mjs';
import { localStore } from '../lib/localStore.mjs';
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
    this.user = userStore.get();
    const currentPath = readPath();

    console.log(!!this.user, currentPath);

    if (!this.user && currentPath === 'sign-out') {
      navigate('home');
    }

    this.render();

    this.unsubscribe = userStore.watch(this.handleUserChange);
  }

  disconnectedCallback() {
    if (this.unsubscribe) this.unsubscribe();
  }

  handleUserChange(newUserValue) {
    this.user = newUserValue;
    this.render();

    const currentPath = readPath();
    if (!this.user && currentPath === 'sign-out') {
      navigate('home');
    }
  }

  handleSignOut(event) {
    localStore.setItem('user', null);
    navigate('home');
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
