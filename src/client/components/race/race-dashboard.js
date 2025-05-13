import {
  getRaceById,
  convertTimeToTimestamp,
} from '../../lib/utils.mjs';

class RaceDashboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: 'open',
    });
    this.raceId = new URLSearchParams(window.location.search).get('id');
    this.race = null;
    this.raceTimerElement = null;
    this.startButton = null;

    this.raceActualEndTime = null;
    this.startTimeStamp = null;
  }

  async connectedCallback() {
    if (!this.raceId) {
      this.renderNotFound();
      return;
    }

    await this.fetchRaceData();

    this.raceActualEndTime = this.race && this.race.race_end_time ? convertTimeToTimestamp(this.race.race_end_time) : null;

    if (this.race && this.race.race_start_time) {
      try {
        this.startTimeStamp = convertTimeToTimestamp(this.race.race_start_time);
      } catch (error) {
        this.startTimeStamp = null;
      }
    } else {
      this.startTimeStamp = null;
    }

    this.render();
  }

  disconnectedCallback() {
    if (this.startButton) {
      this.startButton.removeEventListener('race-started', this.handleRaceStarted.bind(this));
      this.startButton.removeEventListener('race-start-error', this.handleRaceStartError.bind(this));
      this.startButton.removeEventListener('race-stopped', this.handleRaceStopped.bind(this));
      this.startButton.removeEventListener('race-stop-error', this.handleRaceStopError.bind(this));
    }
  }

  async fetchRaceData() {
    const result = await getRaceById(this.raceId, true, true);

    if (!result.success) {
      this.renderNotFound();
      this.race = null;
      return false;
    }

    this.race = result.race;
    return true;
  }

  renderNotFound() {
    this.shadowRoot.innerHTML = `
      <div>
        <h1>Race Not Found</h1>
        <p>The race with ID ${this.raceId} could not be loaded.</p>
      </div>
    `;
  }

  render() {
    if (!this.race) return;

    const isRunning = this.race && this.race.race_start_time && !this.raceActualEndTime;

    this.shadowRoot.innerHTML = `
      <div>
        <h1>${this.race.race_name}</h1>
        <p>Race date: ${this.race.race_date}</p>
        <p>Scheduled Check In Open Time: ${this.race.check_in_open_time ? this.race.check_in_open_time : 'N/A'}</p>
         <open-check-in-button></open-check-in-button>
        <p id="race-start-time">Race Start Time: ${this.race.race_start_time ? this.race.race_start_time : 'Not started yet'}</p>
        <p id="race-end-time">Race End Time: ${this.race.race_end_time ?? 'Not ended yet'}</p>
        <p>Participants checked in: ${this.race.race_participant.filter(p => !!p.checked_in).length}</p>
        <p>Participants registered: ${this.race.race_participant.length}</p>
        <race-start-button race-id="${this.raceId}" is-running="${isRunning}"></race-start-button>
        <race-timer start-time="${this.startTimeStamp}" is-running="${isRunning}"></race-timer>
      </div>
    `;

    this.startButton = this.shadowRoot.querySelector('race-start-button');
    this.raceTimerElement = this.shadowRoot.querySelector('race-timer');

    this.startButton.addEventListener('race-started', this.handleRaceStarted.bind(this));
    this.startButton.addEventListener('race-start-error', this.handleRaceStartError.bind(this));
    this.startButton.addEventListener('race-stopped', this.handleRaceStopped.bind(this));
    this.startButton.addEventListener('race-stop-error', this.handleRaceStopError.bind(this));
  }

  handleRaceStarted(event) {
    const { time } = event.detail;

    if (this.race) {
      this.race.race_start_time = time;
      try {
        this.startTimeStamp = convertTimeToTimestamp(time);
      } catch (error) {
        this.startTimeStamp = null;
      }
    }
    this.raceActualEndTime = null;

    const startEl = this.shadowRoot.getElementById('race-start-time');
    if (startEl) startEl.textContent = `Race Start Time: ${time}`;

    const endEl = this.shadowRoot.getElementById('race-end-time');
    if (endEl) endEl.textContent = 'Race End Time: Not ended yet';

    if (this.raceTimerElement) {
      this.raceTimerElement.setAttribute('start-time', this.startTimeStamp);
      this.raceTimerElement.setAttribute('is-running', 'true');
    }


    if (this.startButton) {
      this.startButton.setAttribute('is-running', 'true');
    }
  }

  handleRaceStopped(event) {
    const { time } = event.detail;


    let endTimeStamp = null;
    try {
      endTimeStamp = convertTimeToTimestamp(time);
    } catch (error) {
    }

    this.raceActualEndTime = endTimeStamp;
    if (this.race) {
      this.race.race_end_time = time;
    }


    if (this.raceTimerElement) {
      this.raceTimerElement.setAttribute('is-running', 'false');
    }


    if (this.startButton) {
      this.startButton.setAttribute('is-running', 'false');
    }

    const endEl = this.shadowRoot.getElementById('race-end-time');
    if (endEl && this.raceActualEndTime !== null) {
      endEl.textContent = `Race End Time: ${this.race.race_end_time}`;
    } else if (endEl) {
      endEl.textContent = 'Race End Time: Not ended yet';
    }
  }


  handleRaceStartError(event) {
    const { error } = event.detail;

    if (this.startButton) {
      this.startButton.setAttribute('is-running', 'false');
    }
  }

  handleRaceStopError(event) {
    const { error } = event.detail;

    if (this.startButton) {
      this.startButton.setAttribute('is-running', 'true');
    }
  }
}

customElements.define('race-dashboard', RaceDashboard);
