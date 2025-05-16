import { templates } from '../../index.mjs';
import { convertTimeToTimestamp, getRaceById } from '../../lib/utils.mjs';

class ViewerView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.raceId = new URLSearchParams(window.location.search).get('id');
    this.checkpoint = new URLSearchParams(window.location.search).get('checkpoint') ?? 1;
    this.race = null;
  }

  async connectedCallback() {
    if (!this.raceId) {
      this.renderNotFound();
      return;
    }

    const fetchSuccess = await this.fetchRace();

    if (fetchSuccess) {
      this.render();
    } else {
      this.renderNotFound();
    }
  }

  async fetchRace() {
    const result = await getRaceById(this.raceId, true);

    if (!result.success) {
      this.renderNotFound();
      this.race = null;
      return false;
    }

    this.race = result.race;
    return true;
  }

  renderNotFound() {
    this.shadowRoot.innerHTML = 'not-found';
  }

  render() {
    if (!this.race) {
      return;
    }

    this.shadowRoot.innerHTML = '';
    const template = templates.viewerView.content.cloneNode(true);

    template.querySelector('h1').textContent = this.race.race_name;

    const isRunning = this.race.race_start_time && !this.race.race_end_time;
    if (isRunning) {
      const startTimeStamp = convertTimeToTimestamp(this.race.race_start_time);
      const raceTimer = template.querySelector('race-timer');
      raceTimer.setAttribute('is-running', true);
      raceTimer.setAttribute('start-time', startTimeStamp);
    }

    const checkpointButtons = template.querySelector('#checkpoints');
    for (const checkpoint of this.race.race_checkpoint) {
      const button = document.createElement('button');
      button.textContent = checkpoint.checkpoint_position;

      if (String(checkpoint.checkpoint_position) === String(this.checkpoint)) {
        button.classList.add('active');
      }

      button.addEventListener('click', () => {
        const params = new URLSearchParams(window.location.search);
        params.set('checkpoint', checkpoint.checkpoint_position);
        params.set('id', this.raceId);
        window.location.search = params.toString();
      });

      checkpointButtons.append(button);
    }

    if (this.checkpoint) {
      const checkpoint = this.race.race_checkpoint.find(c => String(c.checkpoint_position) === String(this.checkpoint));
      if (checkpoint) {
        template.querySelector('h2').textContent = checkpoint.checkpoint_name;
      }
    }

    this.shadowRoot.append(template);
  }
}

customElements.define('viewer-view', ViewerView);
