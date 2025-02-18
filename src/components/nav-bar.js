import "./link.js";

export class NavBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // Use "open" so styles can be applied externally
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const navItems = [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ];

    this.shadowRoot.innerHTML = `
      <nav>
        ${navItems
        .map(
          (item) => `
              <custom-link href="${item.href}" target="_self">
                ${item.label}
              </custom-link>
            `
        )
        .join("")}
      </nav>
    `;
  }
}

customElements.define("nav-bar", NavBar);