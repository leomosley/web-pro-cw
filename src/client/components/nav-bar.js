import { ui } from "../index.mjs";

class NavBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <nav>
        <ul>
        </ul>
      </nav >
  `;

    const nav = [
      { label: 'Home', view: 'home' },
      { label: 'Organise', view: 'organise' },
      { label: 'Profile', view: 'profile' },
    ];

    const navList = this.shadowRoot.querySelector('ul');
    for (const item of nav) {
      const listItem = document.createElement('li');
      const navButton = document.createElement('nav-button');

      navButton.setAttribute('view', item.view);
      navButton.textContent = item.label;

      listItem.append(navButton);
      navList.append(listItem);

      ui.buttons[item.view] = navButton;
    }

    this.shadowRoot.append(navList);
  }
}

customElements.define('nav-bar', NavBar);
