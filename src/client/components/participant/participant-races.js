import { localStore } from '../../lib/localStore.mjs';
import { getAllParticipantsRaces } from '../../lib/utils.mjs';

class ParticipantRaces extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.raceList = document.createElement('race-list');
    this.shadowRoot.append(this.raceList);
  }

  async connectedCallback() {
    const participantId = localStore.getItem('participantId');

    if (!participantId) {
      const error = document.createElement('p');
      error.textContent = 'Failed to load races.';
      this.shadowRoot.append(error);
    }

    const result = await getAllParticipantsRaces();

    if (!result.success) {
      const error = document.createElement('p');
      error.textContent = 'Failed to load races.';
      this.shadowRoot.append(error);
      return;
    }

    this.raceList.setAttribute('role', 'participant');
    this.raceList.races = result.races;
  }
}

customElements.define('participant-races', ParticipantRaces);
