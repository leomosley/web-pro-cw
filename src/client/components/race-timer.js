import { formatTime, calculateElapsedTime } from '../utils.js';

class RaceTimer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.timerInterval = null;
  }

  connectedCallback() {
    this.startTime = this.getAttribute('raceStartTime');
    this.render();
    this.startTimer(); // Call startTimer in connectedCallback
  }

  disconnectedCallback() {
    clearInterval(this.timerInterval); // Clear interval when element is removed
  }

  startTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    const startTime = new Date(this.startTime);
    const timer = this.shadowRoot.querySelector('#timer');

    const updateTimer = () => {
      const now = new Date();
      timer.textContent = calculateElapsedTime(startTime, now);
    };

    updateTimer(); // Call immediately to avoid initial delay
    this.timerInterval = setInterval(updateTimer, 1000);
  }

  static get observedAttributes() {
    return ['raceStartTime']; // Define observed attributes
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'raceStartTime' && newValue !== oldValue) {
      this.startTime = newValue;
      this.startTimer(); // Restart timer when attribute changes
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div>
        <span id="timer"></span>
      </div>
    `;
  }
}

customElements.define('race-timer', RaceTimer);
