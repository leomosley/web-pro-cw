import { templates } from '../../index.mjs';
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

    const fetchSuccess = await this.fetchRaceData();

    if (fetchSuccess) {
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
      this.attachButtonListeners();
    }
  }

  disconnectedCallback() {
    this.removeButtonListeners();
  }

  attachButtonListeners() {
    this.startButton = this.shadowRoot.querySelector('race-start-button');
    this.raceTimerElement = this.shadowRoot.querySelector('race-timer');

    if (this.startButton) {
      this.startButton.addEventListener('race-started', this.handleRaceStarted.bind(this));
      this.startButton.addEventListener('race-start-error', this.handleRaceStartError.bind(this));
      this.startButton.addEventListener('race-stopped', this.handleRaceStopped.bind(this));
      this.startButton.addEventListener('race-stop-error', this.handleRaceStopError.bind(this));
    }
  }

  removeButtonListeners() {
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
    this.shadowRoot.innerHTML = '';
    const template = templates.raceDashboardNotFound.content.cloneNode(true);
    const raceIdSpan = template.querySelector('#race-id-display');
    if (raceIdSpan) {
      raceIdSpan.textContent = this.raceId;
    }
    this.shadowRoot.append(template);
  }

  render() {
    if (!this.race) {
      return;
    }

    this.shadowRoot.innerHTML = '';
    const template = templates.raceDashboard.content.cloneNode(true);

    const raceNameHeader = template.querySelector('Header h1');
    if (raceNameHeader) {
      raceNameHeader.textContent = this.race.race_name;
    }

    const raceDateSpan = template.querySelector('#race-date');
    if (raceDateSpan) {
      raceDateSpan.textContent = this.race.race_date;
    }

    const checkInOpenTimeSpan = template.querySelector('#check-in-open-time');
    if (checkInOpenTimeSpan) {
      checkInOpenTimeSpan.textContent = this.race.check_in_open_time ? this.race.check_in_open_time : 'N/A';
    }

    const raceStartTimePara = template.querySelector('#race-start-time');
    if (raceStartTimePara) {
      raceStartTimePara.textContent = `Race Start Time: ${this.race.race_start_time ? this.race.race_start_time : 'Not started yet'}`;
    }

    const raceEndTimePara = template.querySelector('#race-end-time');
    if (raceEndTimePara) {
      raceEndTimePara.textContent = `Race End Time: ${this.race.race_end_time ?? ''}`;
    }

    const participantsCheckedInSpan = template.querySelector('#participants-checked-in');
    if (participantsCheckedInSpan) {
      participantsCheckedInSpan.textContent = `${this.race.race_participant.filter(p => !!p.checked_in).length}/${this.race.race_participant.length}`;
    }

    const participantsRegisteredSpan = template.querySelector('#participants-registered');
    if (participantsRegisteredSpan) {
      participantsRegisteredSpan.textContent = this.race.race_participant.length;
    }


    const isRunning = this.race.race_start_time && !this.raceActualEndTime;

    const raceStartButton = template.querySelector('race-start-button');
    if (raceStartButton) {
      raceStartButton.setAttribute('race-id', this.raceId);
      raceStartButton.setAttribute('is-running', isRunning.toString());
    }

    const raceTimer = template.querySelector('race-timer');
    if (raceTimer) {
      const isRunning = this.race.race_start_time && !this.raceActualEndTime;
      raceTimer.setAttribute('start-time', this.startTimeStamp);
      raceTimer.setAttribute('is-running', isRunning.toString());
    }

    const viewerShare = template.querySelector('#viewer-share');
    viewerShare.href = `/app/view?id=${this.raceId}`;

    const volunteerShare = template.querySelector('#volunteer-share');
    volunteerShare.href = `/app/volunteer?id=${this.raceId}`;

    this.viewResults = template.querySelector('#results');
    this.viewResults.href = `/app/race/results?id=${this.raceId}`;

    if (!isRunning) {
      this.viewResults.classList.remove('hidden');
    }
    this.shadowRoot.append(template);
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

    const startEl = this.shadowRoot.querySelector('#race-start-time');
    if (startEl) {
      startEl.textContent = `Race Start Time: ${time}`;
    }

    const endEl = this.shadowRoot.querySelector('#race-end-time');
    if (endEl) {
      endEl.textContent = 'Race End Time: Not ended yet';
    }

    if (this.raceTimerElement) {
      this.raceTimerElement.setAttribute('start-time', this.startTimeStamp);
      this.raceTimerElement.setAttribute('is-running', 'true');
    }

    if (this.startButton) {
      this.startButton.setAttribute('is-running', 'true');
    }


    if (this.viewResults) {
      this.viewResults.classList.add('hidden');
    }
  }

  handleRaceStopped(event) {
    const { time } = event.detail;

    let endTimeStamp = null;
    try {
      endTimeStamp = convertTimeToTimestamp(time);
    } catch (error) {
      // handle error
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

    const endEl = this.shadowRoot.querySelector('#race-end-time');
    if (endEl && this.race && this.race.race_end_time !== undefined && this.race.race_end_time !== null) {
      endEl.textContent = `Race End Time: ${this.race.race_end_time}`;
    } else if (endEl) {
      endEl.textContent = 'Race End Time: Not ended yet';
    }


    if (this.viewResults) {
      this.viewResults.classList.remove('hidden');
    }
  }


  handleRaceStartError(event) {
    const { error } = event.detail;

    if (this.startButton) {
      this.startButton.setAttribute('is-running', 'false');
    }


    if (this.viewResults) {
      this.viewResults.classList.remove('hidden');
    }
  }

  handleRaceStopError(event) {
    const { error } = event.detail;

    if (this.startButton) {
      this.startButton.setAttribute('is-running', 'true');
    }

    if (this.viewResults) {
      this.viewResults.classList.add('hidden');
    }
  }
}

customElements.define('race-dashboard', RaceDashboard);
