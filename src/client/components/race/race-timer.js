import { calculateElapsedTime, formatTime } from '../../lib/utils.mjs';

class RaceTimer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.timerInterval = null;
    this.startTime = null;
  }

  static get observedAttributes() {
    return ['start-time'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'start-time') {
      const parsed = Number(newValue);
      if (!isNaN(parsed)) {
        this.startTime = parsed;
        this.restartTimer();
      }
    }
  }

  connectedCallback() {
    this.render();
    this.startTime = Number(this.getAttribute('start-time')) || Date.now();
    this.startTimer();
  }

  disconnectedCallback() {
    this.stopTimer();
  }

  render() {
    this.shadowRoot.innerHTML = '<span>00:00:00</span>';
  }

  startTimer() {
    if (this.timerInterval) return;

    this.timerInterval = setInterval(() => {
      console.log(this.startTime);
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
