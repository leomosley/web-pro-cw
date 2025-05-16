import { templates } from '../../index.mjs';
import { userStore } from '../../lib/auth.mjs';
import { navigate, readPath } from '../../lib/views.mjs';

class OnboardingView extends HTMLElement {
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
    if (currentPath === 'onboarding' && !this.user) {
      return navigate('home');
    }

    if (currentPath === 'onboarding' && this.user && this.user.onboarded) {
      return navigate('home');
    }

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
    this.render();

    const currentPath = readPath();
    if (currentPath === 'onboarding' && !this.user) {
      navigate('home');
    }

    if (currentPath === 'onboarding' && this.user && this.user.onboarded) {
      navigate('home');
    }
  }

  handleSubmit() {
    if (!this.user || !this.user.role) {
      alert('Please select a role before submitting.');
      return;
    }
    this.user.onboarded = true;
    userStore.set(this.user);
    navigate('home');
  }

  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(templates.onboardingView.content.cloneNode(true));
    const submitButton = this.shadowRoot.querySelector('button');
    submitButton.addEventListener('click', this.handleSubmit);
  }
}

customElements.define('onboarding-view', OnboardingView);
