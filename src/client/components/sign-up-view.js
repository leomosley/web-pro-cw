import { getUser } from "../app.mjs";
import { localStore } from "../lib/localstore.mjs";
import { navigate } from "../lib/views.mjs";

class SignUpView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.user = null;

    this.handleUserChange = this.handleUserChange.bind(this);
  }

  connectedCallback() {
    this.user = getUser();

    if (this.user) {
      navigate('home');
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

      if (this.user) {
        navigate('home');
      }
    }
  }

  handleSignIn(event) {
    localStore.setItem('user', {
      role: 'participant'
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

      const button = document.createElement('button');
      button.addEventListener('click', this.handleSignIn.bind(this));
      button.textContent = 'Sign Up';

      this.shadowRoot.appendChild(button);
    } else {
      navigate('home');
    }
  }
}

customElements.define('sign-up-view', SignUpView);