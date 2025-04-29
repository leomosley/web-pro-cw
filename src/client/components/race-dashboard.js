import { getRaceById } from '../lib/utils.mjs';

class RaceDashboard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.raceId = new URLSearchParams(window.location.search).get('id');
    this.race = null;
    this.raceTimerElement = null;
    this.startButton = null;
    this.startTime = null;
    this.autoStartTimer = null;
  }

  connectedCallback() {
    if (!this.raceId) return this.renderNotFound();
    this.race = getRaceById(this.raceId);

    if (!this.race) return this.renderNotFound();

    this.render();
    this.checkAndAutoStartRace();
    this.updateButtonState();
  }

  disconnectedCallback() {
    if (this.autoStartTimer) {
      clearTimeout(this.autoStartTimer);
    }
  }

  renderNotFound() {
    this.shadowRoot.innerHTML = `
      <div>
        <h1>Race Not Found</h1>
      </div>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = '';

    const title = document.createElement('h1');
    title.textContent = `${this.race.race_name}`;
    this.shadowRoot.appendChild(title);

    const now = new Date();

    const raceDate = document.createElement('p');
    raceDate.textContent = `Race Date: ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    this.shadowRoot.appendChild(raceDate);

    const checkInOpenTime = document.createElement('p');
    checkInOpenTime.textContent = `Check In Open Time: ${new Date(now.getTime() - 2000000).toLocaleTimeString()}`;
    this.shadowRoot.appendChild(checkInOpenTime);

    const raceStartTime = document.createElement('p');
    this.startTime = this.race.startTime || (now.getTime() + 2000000);
    raceStartTime.textContent = `Race Start Time: ${new Date(this.startTime).toLocaleTimeString()}`;
    this.shadowRoot.appendChild(raceStartTime);


    this.startButton = document.createElement('button');
    this.startButton.addEventListener('click', this.toggleRace.bind(this));
    this.shadowRoot.appendChild(this.startButton);

    this.raceTimerElement = document.createElement('race-timer');
    if (this.startTime) {
      this.raceTimerElement.setAttribute('start-time', this.startTime);
    }
    this.shadowRoot.appendChild(this.raceTimerElement);
  }

  toggleRace() {
    if (this.raceTimerElement && this.raceTimerElement.timerInterval) {
      this.stopRace();
    } else {
      this.startRace();
    }
  }

  startRace() {
    if (this.raceTimerElement && !this.raceTimerElement.timerInterval) {
      this.raceTimerElement.startTime = Date.now();
      this.raceTimerElement.saveStartTime();
      this.raceTimerElement.startTimer();
      this.updateButtonState();
      console.log('Race started manually.');
    } else if (this.raceTimerElement && this.raceTimerElement.timerInterval) {
      console.log('Race timer is already running.');
    } else {
      console.warn('Race timer element not found.');
    }
  }

  stopRace() {
    if (this.raceTimerElement && this.raceTimerElement.timerInterval) {
      this.raceTimerElement.stopTimer();
      this.updateButtonState();
      console.log('Race stopped manually.');
    } else if (this.raceTimerElement && !this.raceTimerElement.timerInterval) {
      console.log('Race timer is already stopped.');
    } else {
      console.warn('Race timer element not found.');
    }
  }

  updateButtonState() {
    if (this.startButton && this.raceTimerElement) {
      if (this.raceTimerElement.timerInterval) {
        this.startButton.textContent = 'Stop Race';
      } else {
        this.startButton.textContent = 'Start Race';
      }
    }
  }

  checkAndAutoStartRace() {
    if (!this.startTime || !this.raceTimerElement) return;

    const now = Date.now();
    const timeUntilStart = this.startTime - now;

    if (timeUntilStart <= 0) {
      this.startRace();
    } else {
      this.autoStartTimer = setTimeout(() => {
        this.startRace();
        console.log('Race started automatically.');
      }, timeUntilStart);
    }
  }
}

customElements.define('race-dashboard', RaceDashboard);
