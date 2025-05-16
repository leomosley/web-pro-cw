import { localStore } from '../../lib/localStore.mjs';
import { userStore } from '../../lib/auth.mjs';
import { templates } from '../../index.mjs';

class SignOutButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.handleClick = this.handleClick.bind(this);
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(templates.signOutButton.content.cloneNode(true));

    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', this.handleClick);
  }

  handleClick() {
    localStore.clear();
    userStore.set(null);
  }
}

customElements.define('sign-out-button', SignOutButton);
