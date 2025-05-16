class BackButton extends HTMLElement {
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

  render() {
    this.shadowRoot.innerHTML = this.innerHTML;
  }

  handleClick() {
    history.back();
  }
}

customElements.define('back-button', BackButton);
