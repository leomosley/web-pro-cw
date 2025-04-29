import { ui } from '../app.mjs';
import { navigate } from '../lib/views.mjs';

class NavButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = '';

    const button = document.createElement('button');
    button.dataset.view = this.getAttribute('view');
    button.textContent = this.textContent;

    button.addEventListener('click', this.handleClick.bind(this));

    this.shadowRoot.appendChild(button);
  }

  handleClick(event) {
    navigate(event?.target?.dataset?.view ?? 'home');
  }
}

customElements.define('nav-button', NavButton);
