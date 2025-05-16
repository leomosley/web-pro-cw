import { templates } from '../../index.mjs';
import { userStore } from '../../lib/auth.mjs';
import { navigate, readPath } from '../../lib/views.mjs';

class SignInView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.user = null;

    this.handleUserChange = this.handleUserChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  connectedCallback() {
    this.user = userStore.get();
    const currentPath = readPath();

    if (this.user && currentPath === 'sign-in') {
      return navigate('home');
    }

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
    this.render();

    const currentPath = readPath();
    if (this.user && currentPath === 'sign-in') {
      navigate('home');
    }
  }

  handleSubmit() {
    userStore.set({
      id: 1,
    });
  }

  render() {
    this.shadowRoot.innerHTML = '';

    if (!this.user) {
      this.shadowRoot.append(templates.signInView.content.cloneNode(true));

      const button = this.shadowRoot.querySelector('button');
      button.addEventListener('click', this.handleSubmit.bind(this));
    } else {
      this.shadowRoot.innerHTML = '<p>You are already signed in.</p>';
    }
  }
}

customElements.define('sign-in-view', SignInView);
