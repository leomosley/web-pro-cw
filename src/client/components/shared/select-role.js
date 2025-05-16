import { templates } from '../../index.mjs';
import { userStore } from '../../lib/auth.mjs';

class SelectRole extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.selectedRole = null;
    this.user = null;

    this.handleRoleSelect = this.handleRoleSelect.bind(this);
    this.handleUserChange = this.handleUserChange.bind(this);
  }

  connectedCallback() {
    this.user = userStore.get();
    this.render();

    this.unsubscribe = userStore.watch(this.handleUserChange);
  }

  disconnectedCallback() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  handleUserChange(newUserValue) {
    this.user = newUserValue;
    if (this.user && this.user.role !== this.selectedRole) {
      this.selectedRole = this.user.role;
      this.updateButtonSelection();
    }
  }

  updateButtonSelection() {
    const buttons = this.shadowRoot.querySelectorAll('button');

    for (const button of buttons) {
      if (button.dataset.role === this.selectedRole) {
        button.classList.add('selected');
      } else {
        button.classList.remove('selected');
      }
    }
  }

  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(templates.selectRole.content.cloneNode(true));

    const buttons = this.shadowRoot.querySelectorAll('button');

    for (const button of buttons) {
      button.addEventListener('click', this.handleRoleSelect);
    }

    if (this.user && this.user.role) {
      this.selectedRole = this.user.role;
      this.updateButtonSelection();
    }
  }

  handleRoleSelect(event) {
    const newRole = event.target.dataset.role;
    let roleToSet = null;

    const buttons = this.shadowRoot.querySelectorAll('button.selected');

    for (const button of buttons) {
      button.classList.remove('selected');
    }
    this.selectedRole = newRole;
    event.target.classList.add('selected');
    roleToSet = newRole;

    if (this.user) {
      this.user.role = roleToSet;
      userStore.set(this.user);
    }
  }
}

customElements.define('select-role', SelectRole);
