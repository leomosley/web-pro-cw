class CheckOut extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <label for="pid">Participant ID</label>
      <input name="pid" placeholder="PXXXXX" type="text" />
      <label for="position">Position</label>
      <input name="position" type="number" />
    `;

    const button = document.createElement('button');
    button.textContent = 'Check Out';
    button.addEventListener('click', this.handleClick.bind(this));
    this.shadowRoot.append(button);
  }

  async handleClick() {
    const participantId = this.shadowRoot.querySelector('input[name="pid"]').value.trim();
    const position = parseInt(this.shadowRoot.querySelector('input[name="position"]').value, 10);
    const raceId = new URLSearchParams(window.location.search).get('id');

    if (!participantId || !raceId || isNaN(position)) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/race/${raceId}/check-out`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant_id: participantId,
          finish_position: position,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err);
      }
    } catch (error) {
    }
  }
}

customElements.define('check-out', CheckOut);
