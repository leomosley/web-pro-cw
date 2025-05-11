import {
  getRaceById,
  convertTimeToTimestamp // Assuming this returns a number (timestamp)
} from '../../lib/utils.mjs';

class RaceDashboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: 'open'
    });
    this.raceId = new URLSearchParams(window.location.search).get('id');
    this.race = null;
    this.raceTimerElement = null;
    this.startButton = null;

    this.raceActualEndTime = null; // Timestamp of when the race actually ended
    this.startTimeStamp = null; // Timestamp of when the race actually started
  }

  async connectedCallback() {
    if (!this.raceId) {
      this.renderNotFound();
      return;
    }

    await this.fetchRaceData();

    this.raceActualEndTime = this.race ? this.race.race_end_time || null : null;

    // Calculate and store startTimeStamp based on fetched data
    if (this.race && this.race.race_start_time) {
      try {
        this.startTimeStamp = convertTimeToTimestamp(this.race.race_start_time);
      } catch (error) {
        console.error('RaceDashboard: Error converting race start time to timestamp from fetched data:', error);
        this.startTimeStamp = null;
      }
    } else {
      this.startTimeStamp = null; // Set to null if race data is missing start time
    }

    this.render();
  }

  disconnectedCallback() {
    if (this.startButton) {
      this.startButton.removeEventListener('race-started', this.handleRaceStarted);
      this.startButton.removeEventListener('race-start-error', this.handleRaceStartError);
      this.startButton.removeEventListener('race-stopped', this.handleRaceStopped);
      this.startButton.removeEventListener('race-stop-error', this.handleRaceStopError);
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

    this.shadowRoot.innerHTML = `
      <div>
        <h1>${this.race.race_name}</h1>
        <p>Race date: ${this.race.race_date}</p>
        <p>Scheduled Check In Open Time: ${this.race.check_in_open_time ? this.race.check_in_open_time : 'N/A'}</p>
         <open-check-in-button></open-check-in-button>
        <p id="race-start-time">Race Start Time: ${this.race.race_start_time ? this.race.race_start_time : 'Not started yet'}</p>
        <p id="race-end-time">Race End Time: ${this.raceActualEndTime ? new Date(this.raceActualEndTime).toLocaleTimeString() : 'Not ended yet'}</p>
        <p>Participants checked in: ${this.race.race_participant.filter(p => !!p.checked_in).length}</p>
        <p>Participants registered: ${this.race.race_participant.length}</p>
        <race-start-button race-id="${this.raceId}"></race-start-button>
        <race-timer></race-timer>
      </div>
    `;

    this.startButton = this.shadowRoot.querySelector('race-start-button');
    this.raceTimerElement = this.shadowRoot.querySelector('race-timer');

    // Determine if the race is currently running based on fetched data
    const isRunning = this.race && this.race.race_start_time && !this.raceActualEndTime;
    this.startButton.setAttribute('is-running', isRunning.toString());

    this.startButton.addEventListener('race-started', this.handleRaceStarted.bind(this));
    this.startButton.addEventListener('race-start-error', this.handleRaceStartError.bind(this));
    this.startButton.addEventListener('race-stopped', this.handleRaceStopped.bind(this));
    this.startButton.addEventListener('race-stop-error', this.handleRaceStopError.bind(this));

    if (isRunning && this.raceTimerElement && this.startTimeStamp !== null) {
      this.raceTimerElement.setAttribute('start-time', this.startTimeStamp);
    } else if (this.raceTimerElement) {
      this.raceTimerElement.setAttribute('start-time', null);
    }
  }

  handleRaceStarted(event) {
    const { time } = event.detail; // Assuming time is the time string (e.g., "10:00:00")

    if (this.race) {
      this.race.race_start_time = time; // Update race data with the actual start time string
      try {
        // Calculate and set the numerical timestamp
        this.startTimeStamp = convertTimeToTimestamp(time);
      } catch (error) {
        console.error('RaceDashboard: Error converting started race time to timestamp:', error);
        this.startTimeStamp = null;
      }
    }
    this.raceActualEndTime = null; // Reset end time as the race has started

    const startEl = this.shadowRoot.getElementById('race-start-time');
    if (startEl) startEl.textContent = `Race Start Time: ${time}`;

    const endEl = this.shadowRoot.getElementById('race-end-time');
    if (endEl) endEl.textContent = `Race End Time: Not ended yet`;

    // **Start the timer by setting the start-time attribute:**
    if (this.raceTimerElement && this.startTimeStamp !== null) {
      this.raceTimerElement.setAttribute('start-time', this.startTimeStamp);
    }
  }

  handleRaceStopped(event) {
    const { time } = event.detail; // Assuming time is the actual end time timestamp

    this.raceActualEndTime = time; // This should be the timestamp
    if (this.race) this.race.race_end_time = time; // Update race data with the end timestamp

    // **Stop the timer by setting start-time to null:**
    if (this.raceTimerElement) {
      this.raceTimerElement.stopTimer(); // Explicitly stop the interval
      this.raceTimerElement.setAttribute('start-time', null); // Signal the timer component to stop
    }

    const endEl = this.shadowRoot.getElementById('race-end-time');
    // Display the race end time using the timestamp
    if (endEl && this.raceActualEndTime !== null) {
      endEl.textContent = `Race End Time: ${new Date(this.raceActualEndTime).toLocaleTimeString()}`;
    } else if (endEl) {
      endEl.textContent = `Race End Time: Not ended yet`;
    }
  }

  handleRaceStartError(event) {
    const { error } = event.detail;
    console.error('Race start error received in dashboard:', error);
  }

  handleRaceStopError(event) {
    const { error } = event.detail;
    console.error('Race stop error received in dashboard:', error);
  }

}

customElements.define('race-dashboard', RaceDashboard);
