function formatTime(milliseconds) {
  const isNegative = milliseconds < 0;
  milliseconds = Math.abs(milliseconds);

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedTime = [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');

  return isNegative ? `-${formattedTime}` : formattedTime;
}

function calculateElapsedTime(startTime, endTime) {
  const elapsed = endTime - startTime;
  return formatTime(elapsed);
}

class RaceTimer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.timerInterval = null;
  }

  connectedCallback() {
    this.startTime = this.getAttribute('raceStartTime');
    this.render();
    this.observeAttributes();
    this.startTimer();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    const startTime = new Date(this.getAttribute('raceStartTime'));
    const timer = this.shadowRoot.querySelector('#timer');

    const updateTimer = () => {
      if (this.getAttribute('stop') === 'true') {
        clearInterval(this.timerInterval);
        return;
      }

      const now = new Date();
      if (now < startTime) {
        timer.textContent = formatTime(startTime - now);
      } else {
        timer.textContent = calculateElapsedTime(startTime, now);
      }
    };

    updateTimer();
    this.timerInterval = setInterval(updateTimer, 1000);
  }

  observeAttributes() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'stop') {
          if (this.getAttribute('stop') === 'true') {
            clearInterval(this.timerInterval);
          } else {
            this.startTimer();
          }
        } else if (mutation.attributeName === 'raceStartTime') {
          this.startTimer(); // Reset timer when raceStartTime changes
        }
      });
    });

    observer.observe(this, { attributes: true });
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
