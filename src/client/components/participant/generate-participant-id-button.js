import { localStore } from '../../lib/localStore.mjs';

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
    this.shadowRoot.innerHTML = `
      <style>
        button {
          padding: 1rem;
          border-radius: 0.5rem;
          font-family: inherit;
          white-space: nowrap;
          display: inline-flex;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.875rem;
          line-height: 1.25rem;
          color: var(--background);
          background: var(--primary);
          border: none;
        }
      </style>
    `;
    const button = document.createElement('button');
    button.dataset.view = this.getAttribute('view');
    button.textContent = 'Generate Participant ID';

    button.addEventListener('click', this.handleClick.bind(this));

    this.shadowRoot.append(button);
  }

  async handleClick(event) {
    try {
      const response = await fetch('/api/participant', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error();
      }

      const id = await response.text();
      localStore.setItem('participantId', id);

      this.dispatchEvent(
        new CustomEvent('participant-id-generated', {
          bubbles: true,
          composed: true,
        }),
      );
    } catch (error) {
      // handle error (dispatch error generating event)
    }
  }
}


customElements.define('generate-participant-id-button', GenerateParticipantIDButton);
