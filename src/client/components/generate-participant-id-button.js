import { localStore } from '../lib/localStore.mjs';
import { generateRandomId } from '../lib/utils.mjs';

class GenerateParticipantIDButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this.shadowRoot.querySelector('button')) {
      this.render();
    }
  }

  render() {
    const button = document.createElement('button');
    button.dataset.view = this.getAttribute('view');
    button.textContent = 'Generate Participant ID';

    button.addEventListener('click', this.handleClick.bind(this));

    this.shadowRoot.appendChild(button);
  }

  async handleClick(event) {
    const participantId = generateRandomId();

    try {
      const response = await fetch('/api/participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant_id: participantId,
        }),
      });

      if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      localStore.setItem('participantId', participantId);

      this.dispatchEvent(
        new CustomEvent('participant-id-generated', {
          bubbles: true,
          composed: true,
        }),
      );
    }
  }
}


customElements.define(
  'generate-participant-id-button',
  GenerateParticipantIDButton,
);
