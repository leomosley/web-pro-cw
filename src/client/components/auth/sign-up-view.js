import { userStore } from '../../lib/auth.mjs';
import { localStore } from '../../lib/localStore.mjs';
import { navigate, readPath } from '../../lib/views.mjs';

class SignUpView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.user = null;

    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
  }

  connectedCallback() {
    this.user = userStore.get();

    const currentPath = readPath();
    if (this.user && currentPath === 'sign-up') {
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
    if (this.user && currentPath === 'sign-up') {
      navigate('home');
    }
  }

  handleSignUp(event) {
    localStore.setItem('user', {
      id: 1,
      onboarded: false,
    });

    navigate('onboarding');
  }

  render() {
    this.shadowRoot.innerHTML = '';

    if (!this.user) {
      const fields = [
        { label: 'Email', type: 'email', name: 'email' },
        { label: 'Password', type: 'password', name: 'password' },
      ];

      for (const field of fields) {
        const label = document.createElement('label');
        label.textContent = field.label;

        const input = document.createElement('input');
        input.type = field.type;
        input.name = field.name;
        input.required = true;

        label.appendChild(input);
        this.shadowRoot.appendChild(label);
      }

      const button = document.createElement('button');
      button.addEventListener('click', this.handleSignUp);
      button.textContent = 'Sign Up';

      this.shadowRoot.appendChild(button);
    }
  }
}

customElements.define('sign-up-view', SignUpView);
