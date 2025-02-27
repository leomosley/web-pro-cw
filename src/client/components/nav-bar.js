class NavBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const navItems = [
      { label: 'Home', href: '/' },
      { label: 'Organise', href: '/organise' },
      { label: 'Participant', href: '/participant' },
      { label: 'View', href: '/view' },
    ];

    this.shadowRoot.innerHTML = `
      <nav>
        ${navItems
        .map(
          (item) => `
              <a href="${item.href}" target="_self">
                ${item.label}
              </a>
            `,
        )
        .join('')}
      </nav>
    `;
  }
}

customElements.define('nav-bar', NavBar);
