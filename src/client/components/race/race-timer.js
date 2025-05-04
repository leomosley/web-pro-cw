import { localStore } from '../../lib/localStore.mjs';
import { calculateElapsedTime, formatTime } from '../../lib/utils.mjs';


const STORAGE_KEY_START_TIME = 'raceTimerStartTime';

class RaceTimer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.timerInterval = null;
    this.startTime = null;
    this.addEventListener('click', this.toggleTimer.bind(this));
  }

  static get observedAttributes() {
    return ['start-time'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'start-time') {
      this.handleStartTimeAttribute(newValue);
      this.updateDisplayForState();
      this.checkAndStartTimer();
    }
  }

  connectedCallback() {
    this.render();
    if (!this.handleStartTimeAttribute(this.getAttribute('start-time'))) {
      this.loadStartTime();
    }
    this.updateDisplayForState();
    this.checkAndStartTimer();
  }

  disconnectedCallback() {
    this.stopTimer();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <span id="timer-display">00:00:00</span>
    `;
  }

  get timerDisplay() {
    return this.shadowRoot.querySelector('#timer-display');
  }

  toggleTimer() {
    if (this.timerInterval) {
      this.stopTimer();
    } else {
      this.checkAndStartTimer(true);
    }
  }

  checkAndStartTimer(forceStart = false) {
    const now = Date.now();
    if (this.startTime !== null && (this.startTime <= now || forceStart)) {
      this.startTimer();
    } else {
      this.stopTimer();
      this.updateDisplayForState();
    }
  }

  startTimer() {
    if (this.timerInterval) return;

    if (this.startTime === null) {
      this.startTime = Date.now();
      this.saveStartTime();
    }

    this.timerInterval = setInterval(() => {
      const currentTime = Date.now();
      const elapsedTime = calculateElapsedTime(this.startTime, currentTime);
      this.updateDisplay(elapsedTime);
    }, 1000);

    this.updateDisplay(calculateElapsedTime(this.startTime, Date.now()));
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateDisplay(timeString) {
    if (this.timerDisplay) {
      this.timerDisplay.textContent = timeString;
    }
  }

  updateDisplayForState() {
    const now = Date.now();
    if (this.startTime === null) {
      this.updateDisplay('00:00:00');
    } else if (this.startTime > now) {
      const timeUntilStart = this.startTime - now;
      this.updateDisplay(formatTime(0));
    } else {
      this.updateDisplay(calculateElapsedTime(this.startTime, now));
    }
  }

  saveStartTime() {
    if (this.startTime !== null) {
      localStore.setItem(STORAGE_KEY_START_TIME, this.startTime);
    } else {
      localStore.removeItem(STORAGE_KEY_START_TIME);
    }
  }

  loadStartTime() {
    const storedStartTime = localStore.getItem(STORAGE_KEY_START_TIME);
    if (storedStartTime !== null) {
      this.startTime = storedStartTime;
    } else {
      this.startTime = null;
    }
  }

  handleStartTimeAttribute(value) {
    if (value !== null) {
      const parsedTime = parseInt(value, 10);
      if (!isNaN(parsedTime)) {
        this.startTime = parsedTime;
        return true;
      } else {
        console.warn(`RaceTimer: Invalid start-time attribute value: "${value}". Expected a number.`);
      }
    }
    return false;
  }

  resetTimer() {
    this.stopTimer();
    this.startTime = null;
    this.saveStartTime();
    this.updateDisplay('00:00:00');
  }
}

customElements.define('race-timer', RaceTimer);
