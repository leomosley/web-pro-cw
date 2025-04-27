import { templates } from "../app.mjs";

class RaceDashboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.raceId = new URLSearchParams(window.location.search).get('id');
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = ``;
    templates
  }
}

customElements.define('race-dashboard', RaceDashboard);