import { templates } from '../../index.mjs';
import { localStore } from '../../lib/localStore.mjs';

class ParticipantView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  connectedCallback() {
    this.addEventListener('popstate', this.render.bind(this));
    this.addEventListener('participant-id-generated', this.render.bind(this));
  }

  disconnectedCallback() {
    this.removeEventListener('popstate', this.render.bind(this));
    this.removeEventListener('participant-id-generated', this.render.bind(this));
  }

  clearId() {
    localStore.removeItem('participantId');
    this.render();
  }

  render() {
    const participantId = localStore.getItem('participantId');

    const clone = templates.participantView.content.cloneNode(true);

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.append(clone);

    const withIdSection = this.shadowRoot.querySelector('#with-id');
    const withoutIdSection = this.shadowRoot.querySelector('#without-id');

    if (participantId) {
      withIdSection.classList.remove('hidden');
      const barcode = this.shadowRoot.querySelector('#barcode');
      const idSpan = this.shadowRoot.querySelector('#participant-id');
      const clearButton = this.shadowRoot.querySelector('#clear-button');

      barcode.setAttribute('value', participantId);
      idSpan.textContent = participantId;
      clearButton.addEventListener('click', this.clearId.bind(this));
    } else {
      withIdSection.classList.add('hidden');
      withoutIdSection.classList.remove('hidden');
    }
  }
}

customElements.define('participant-view', ParticipantView);
