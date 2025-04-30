import { getUser } from '../index.mjs';
import { localStore } from '../lib/localStore.mjs';
import { navigate, readPath } from '../lib/views.mjs';

class SignInView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.user = null;

    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleSignIn = this.handleSignIn.bind(this);
  }

  connectedCallback() {
    this.user = getUser();
    const currentPath = readPath();

    if (this.user && currentPath === 'sign-in') {
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
      if (this.user && currentPath === 'sign-in') {
        navigate('home');
      }
    }
  }

  handleSignIn(event) {
    localStore.setItem('user', {
      id: 1,
    });
  }

  render() {
    this.shadowRoot.innerHTML = '';

    if (!this.user) {
      const form = [
        { label: 'Email', type: 'email', name: 'email' },
        { label: 'Password', type: 'password', name: 'password' },
      ];

      for (const field of form) {
        const label = document.createElement('label');
        label.textContent = field.label;

        const input = document.createElement('input');
        input.type = field.type;
        input.name = field.name;
        input.required = true;

        label.appendChild(input);
        this.shadowRoot.appendChild(label);
      }

      const signInButton = document.createElement('button');
      signInButton.addEventListener('click', this.handleSignIn.bind(this));
      signInButton.textContent = 'Sign In';

      this.shadowRoot.appendChild(signInButton);

      const signUpButton = document.createElement('button');
      signUpButton.addEventListener('click', () => navigate('sign-up'));
      signUpButton.textContent = 'Sign Up';

      this.shadowRoot.appendChild(signUpButton);
    }
  }
}

customElements.define('sign-in-view', SignInView);
