export class Link extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const href = this.getAttribute("href") ?? "#";
    const target = this.getAttribute("target") ?? "_self";
    const isInternal = href.startsWith(window.location.origin); // Detect if it's an internal link

    this.innerHTML = `<a href="${href}" target="${target}">${this.innerHTML}</a>`;

    const anchor = this.querySelector("a");

    // If it's an internal link and target is "_self", intercept the click event
    if (isInternal && target === "_self") {
      anchor.addEventListener("click", (event) => {
        event.preventDefault();
        history.pushState({}, "", href);
        window.dispatchEvent(new Event("popstate"));
      });
    }
  }
}

customElements.define("custom-link", Link);