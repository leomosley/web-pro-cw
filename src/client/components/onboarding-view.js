import { getUser } from '../index.mjs';
import { localStore } from '../lib/localStore.mjs';
import { navigate, readPath } from '../lib/views.mjs';

class OnboardingView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.user = null;

    this.handleUserChange = this.handleUserChange.bind(this);
  }

  connectedCallback() {
    this.user = getUser();

    const currentPath = readPath();
    if (currentPath === 'onboarding' && !this.user) {
      return navigate('home');
    }

    if (currentPath === 'onboarding' && this.user.onboarded) {
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
      if (currentPath === 'onboarding' && !this.user) {
        return navigate('home');
      }

      if (currentPath === 'onboarding' && this.user.onboarded) {
        return navigate('home');
      }
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <header>
        <h1>Onboarding</h1>
        <p>Welcome to the onboarding page!</p>
      </header>
      <section>
        <p>Why are you here?</p>
        <ul></ul>
      </section>
      <footer></footer>
    `;

    const optionsList = this.shadowRoot.querySelector('ul');
    const options = [
      'Participant',
      'Organiser',
      'Volunteer',
      'Viewer'
    ];

    for (const option of options) {
      const li = document.createElement('li');
      const button = document.createElement('button');

      button.textContent = option;
      button.addEventListener('click', () => {
        this.user.role = option.toLowerCase();
      });

      li.append(button);
      optionsList.append(li);
    }

    const footer = this.shadowRoot.querySelector('footer');
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.addEventListener('click', () => {
      if (!this.user.role) {
        alert('Please select a role before submitting.');
        return;
      }
      this.user.onboarded = true;
      localStore.setItem('user', this.user);
      navigate('home');
    });
    footer.append(submitButton);
  }
}

customElements.define('onboarding-view', OnboardingView);
