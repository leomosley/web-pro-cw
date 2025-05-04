import { localStore } from '../../lib/localStore.mjs';

class ParticipantView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  connectedCallback() {
    this.addEventListener('participant-id-generated', this.render.bind(this));
  }

  disconnectedCallback() {
    this.removeEventListener(
      'participant-id-generated',
      this.render.bind(this),
    );
  }

  clearId() {
    localStore.removeItem('participantId');
    this.render();
  }

  render() {
    const participantId = localStore.getItem('participantId');
    this.shadowRoot.innerHTML = `
      <section>
        ${participantId
        ? `
              <participant-barcode value="${participantId}"></participant-barcode>
              <p>ID: ${participantId}</p>
              <button id="clear-button">Clear ID</button>
              <h1>My Races</h1>
              <race-list></race-list>
            `
        : `
              <generate-participant-id-button></generate-participant-id-button>
            `
      }
      </section>
    `;


    const clearButton = this.shadowRoot.querySelector('#clear-button');
    if (clearButton) {
      clearButton.addEventListener('click', this.clearId.bind(this));
    }
  }
}

customElements.define('participant-view', ParticipantView);
