import { storeState, show } from '../lib/views.mjs';

class NavButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const button = document.createElement('button');
    button.dataset.view = this.getAttribute('view');
    button.textContent = this.textContent;

    this.shadowRoot.appendChild(button);

    button.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    show(event);
    storeState();
  }
}

customElements.define('nav-button', NavButton);
