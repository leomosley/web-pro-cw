import { getAllRaces } from '../../lib/utils.mjs';

class OrganiserRaces extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.raceList = document.createElement('race-list');
    this.shadowRoot.append(this.raceList);
  }

  async connectedCallback() {
    const result = await getAllRaces();

    if (!result.success) {
      const error = document.createElement('p');
      error.textContent = 'Failed to load races.';
      this.shadowRoot.append(error);
      return;
    }

    this.raceList.setAttribute('role', 'organiser');
    this.raceList.races = result.races;
  }
}

customElements.define('organiser-races', OrganiserRaces);
