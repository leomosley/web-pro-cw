class CheckIn extends HTMLElement {
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
    `;

    const button = document.createElement('button');
    button.textContent = 'Check In';
    button.addEventListener('click', this.handleClick.bind(this));
    this.shadowRoot.append(button);
  }

  async handleClick() {
    const pid = this.shadowRoot.querySelector('input').value.trim();
    const raceId = new URLSearchParams(window.location.search).get('id');

    if (!pid || !raceId) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/race/${raceId}/check-in`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant_id: pid }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err);
      }
    } catch (error) {
      // handle error
    }
  }
}

customElements.define('check-in', CheckIn);
