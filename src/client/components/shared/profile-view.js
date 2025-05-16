import { templates } from '../../index.mjs';
import { userStore } from '../../lib/auth.mjs';

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
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleUserChange(newUserValue) {
    this.user = newUserValue;
    this.updateRoleDisplay();
  }

  updateRoleDisplay() {
    const roleSpan = this.shadowRoot.getElementById('role');
    if (roleSpan && this.user && this.user.role) {
      roleSpan.textContent = this.user.role;
    } else if (roleSpan) {
      roleSpan.textContent = 'Not set';
    }
  }

  render() {
    this.shadowRoot.innerHTML = '';

    this.shadowRoot.append(templates.profileView.content.cloneNode(true));

    this.updateRoleDisplay();
  }
}

customElements.define('profile-view', ProfileView);
