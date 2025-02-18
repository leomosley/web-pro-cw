export class CustomLink extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }); // Allows isolated component rendering
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const href = this.getAttribute("href") ?? "#";
    const target = this.getAttribute("target") ?? "_self";
    const slotContent = this.innerHTML; // Preserve children before innerHTML reset

    // Use a template to avoid innerHTML wiping out the event listener
    this.shadowRoot.innerHTML = `
      <a href="${href}" target="${target}">
        <slot></slot>
      </a>
    `;

    // Event listener for SPA navigation
    this.shadowRoot.querySelector("a").addEventListener("click", (event) => {
      if (target === "_self") {
        event.preventDefault();
        history.pushState({}, "", href);
        window.dispatchEvent(new Event("popstate"));
      }
    });

    // Restore inner content
    this.shadowRoot.querySelector("slot").innerHTML = slotContent;
  }
}

customElements.define("custom-link", CustomLink);