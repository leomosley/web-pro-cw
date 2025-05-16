class RaceStartButton extends HTMLElement {
  static get observedAttributes() {
    return ['race-id', 'is-running'];
  }

  constructor() {
    super();
    this.attachShadow({
      mode: 'open',
    });
    this.button = null;
    this._raceId = null;
    this._isRunning = false;
    this._isProcessing = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'race-id' && oldValue !== newValue) {
      this._raceId = newValue;
    }
    if (name === 'is-running' && oldValue !== newValue) {
      this._isRunning = newValue === 'true';
      this.updateButtonState();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        button {
          padding: 0.7rem;
          width: 100%;
          border-radius: 0.5rem;
          font-family: inherit;
          white-space: nowrap;
          display: inline-flex;
          justify-content: center;
          cursor: pointer;
          align-items: center;
          font-weight: 500;
          font-size: 0.875rem;
          line-height: 1.25rem;
          border: none;
          color: var(--background);
          background: var(--primary);
        }

        .running {
          background: red;
        }
      </style>
      <button></button>
    `;
    this.button = this.shadowRoot.querySelector('button');
    this.button.addEventListener('click', this.handleClick.bind(this));
    this.updateButtonState();
  }

  async handleClick() {
    if (this._isProcessing) {
      return;
    }

    if (this._isRunning) {
      await this.stopRace();
    } else {
      await this.startRace();
    }
  }

  async startRace() {
    if (this._isProcessing || !this._raceId || this._isRunning) {
      return;
    }

    this._isProcessing = true;
    if (this.button) {
      this.button.disabled = true;
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString();
    const currentDate = now.toLocaleDateString();
    const startUrl = `/api/race/${this._raceId}/start`;
    const stopUrl = `/api/race/${this._raceId}/stop`;
    const body = {
      race_start_time: currentTime,
      race_date: currentDate,
    };

    try {
      const startResponse = await fetch(startUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!startResponse.ok) {
        throw new Error(`HTTP error! status: ${startResponse.status}`);
      }

      const stopResponse = await fetch(stopUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          race_end_time: null,
          race_date: currentDate,
        }),
      });

      if (!stopResponse.ok) {
        throw new Error(`HTTP error! status: ${stopResponse.status}`);
      }

      const result = await startResponse.json();

      this._isRunning = true;
      this.updateButtonState();

      this.dispatchEvent(new CustomEvent('race-started', {
        detail: { time: currentTime, apiResponse: result },
      }));
    } catch (error) {
      this.dispatchEvent(new CustomEvent('race-start-error', {
        detail: { error: error.message },
      }));
    } finally {
      this._isProcessing = false;
      if (this.button) {
        this.button.disabled = false;
      }
    }
  }

  async stopRace() {
    if (this._isProcessing || !this._raceId || !this._isRunning) {
      return;
    }

    this._isProcessing = true;
    if (this.button) {
      this.button.disabled = true;
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString();
    const currentDate = now.toLocaleDateString();
    const url = `/api/race/${this._raceId}/stop`;
    const body = {
      race_end_time: currentTime,
      race_date: currentDate,
    };

    try {
      const stopResponse = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!stopResponse.ok) {
        throw new Error(`HTTP error! status: ${stopResponse.status}`);
      }

      const result = await stopResponse.json();
      this._isRunning = false;
      this.updateButtonState();

      this.dispatchEvent(new CustomEvent('race-stopped', {
        detail: { time: currentTime, apiResponse: result },
      }));
    } catch (error) {
      this.dispatchEvent(new CustomEvent('race-stop-error', {
        detail: { error: error.message },
      }));
    } finally {
      this._isProcessing = false;
      if (this.button) {
        this.button.disabled = false;
      }
    }
  }

  updateButtonState() {
    if (this.button) {
      if (this._isRunning) {
        this.button.textContent = 'Stop Race';
        this.button.classList.add('running');
      } else {
        this.button.textContent = 'Start Race';
        this.button.classList.remove('running');
      }
    }
  }

  triggerStart() {
    this.startRace();
  }
}

customElements.define('race-start-button', RaceStartButton);
