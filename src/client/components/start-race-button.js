class StartRaceButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    this.render();

    const button = this.shadowRoot.querySelector('button');
    const raceId = this.getAttribute('raceId');

    button.addEventListener('click', () => this.handleClick());

    const response = await fetch(`/api/race/${raceId}`, {
      method: 'GET',
    });

    if (response.ok) {
      const data = await response.json();

      button.disabled = data.race_start_time < new Date().toLocaleTimeString();
    }
  }

  async handleClick() {
    const raceId = this.getAttribute('raceId');

    const response = await fetch(`/api/race/${raceId}/start`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        race_start_time: new Date().toLocaleTimeString(),
      }),
    });

    console.log(response);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <button>
        Start Race
      </button>
    `;
  }
}

customElements.define('start-race-button', StartRaceButton);
