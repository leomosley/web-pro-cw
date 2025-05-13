import { calculateElapsedTime, formatTime } from '../../lib/utils.mjs';

class RaceTimer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.timerInterval = null;
    this.startTime = null;
    this.isRunning = false;
  }

  static get observedAttributes() {
    return ['start-time', 'is-running'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'start-time') {
      const parsed = Number(newValue);

      if (!isNaN(parsed) && parsed !== this.startTime) {
        this.startTime = parsed;
        this.restartTimer();
      } else if (newValue === 'null' && this.startTime !== null) {
        this.startTime = null;
        this.restartTimer();
      }
    }
    if (name === 'is-running') {
      const newIsRunning = newValue === 'true';
      if (newIsRunning !== this.isRunning) {
        this.isRunning = newIsRunning;
        console.log('Timer: Updated isRunning:', this.isRunning);
        this.restartTimer();
      }
    }
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    this.stopTimer();
  }

  render() {
    this.shadowRoot.innerHTML = '<span>00:00:00</span>';
  }

  startTimer() {
    if (!this.isRunning || this.timerInterval || this.startTime === null || isNaN(this.startTime)) {
      if (!this.isRunning) {
        this.updateDisplay('00:00:00');
      }
      return;
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

  restartTimer() {
    this.stopTimer();
    this.startTimer();
  }

  updateDisplay(timeString) {
    const timerDisplay = this.shadowRoot.querySelector('span');
    if (timerDisplay) {
      timerDisplay.textContent = timeString;
    }
  }
}

customElements.define('race-timer', RaceTimer);
