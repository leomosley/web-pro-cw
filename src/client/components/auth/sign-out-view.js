import { templates } from '../../index.mjs';
import { userStore } from '../../lib/auth.mjs';
import { navigate, readPath } from '../../lib/views.mjs';

class SignOutView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.user = null;

    this.handleUserChange = this.handleUserChange.bind(this);
  }

  connectedCallback() {
    this.user = userStore.get();
    const currentPath = readPath();

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

  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(templates.signOutView.content.cloneNode(true));
  }
}

customElements.define('sign-out-view', SignOutView);
