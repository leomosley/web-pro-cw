class StartRaceButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isRunning = false;
  }

  connectedCallback() {
    this.render();

    const button = this.shadowRoot.querySelector('button');
    const raceId = this.getAttribute('raceId');
    const raceStartTime = this.getAttribute('raceStartTime');

    this.isRunning = raceStartTime && raceStartTime < new Date().toISOString();
    button.textContent = this.isRunning ? 'Stop Race' : 'Start Race';

    button.disabled = !raceId;

    button.addEventListener('click', () => this.handleClick());
  }

  async handleClick() {
    const raceId = this.getAttribute('raceId');
    const now = new Date().toISOString();
    const endpoint = this.isRunning ? `/api/race/${raceId}/stop` : `/api/race/${raceId}/start`;

    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        [this.isRunning ? 'race_end_time' : 'race_start_time']: now,
      }),
    });

    if (response.ok) {
      this.isRunning = !this.isRunning;
      this.updateButton();
      this.updateRaceTimers(now);
    } else {
      console.error('Failed to update race status', await response.text());
    }
  }

  updateButton() {
    const button = this.shadowRoot.querySelector('button');
    button.textContent = this.isRunning ? 'Stop Race' : 'Start Race';
  }

  updateRaceTimers(now) {
    document.querySelectorAll('race-timer').forEach(timer => {
      if (!this.isRunning) {
        timer.setAttribute('stop', 'true');
      } else {
        timer.setAttribute('raceStartTime', now);
        timer.removeAttribute('stop');
      }
    });
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
