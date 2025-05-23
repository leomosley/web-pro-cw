import { navigate } from '../../lib/views.mjs';

class NavButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  connectedCallback() {
    this.addEventListener('click', this.handleClick.bind(this));
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.handleClick.bind(this));
  }

  handleClick() {
    const view = this.getAttribute('view') ?? 'home';
    navigate(view);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <slot></slot>
    `;
  }
}

customElements.define('nav-button', NavButton);
