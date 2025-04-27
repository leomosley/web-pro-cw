import { localStore } from '../lib/localStore.mjs';

class CreateRaceForm extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <div style="display: flex; flex-direction: column;">
        <label for="race-name">Race Name</label>
        <input name="race-name" type="text" />

        <label for="race-date">Date</label>
        <input name="race-date" type="text" />

        <label for="check-in-open-time">Check in time</label>
        <input name="check-in-open-time" type="text" />

        <label for="race-start-time">Race start time</label>
        <input name="race-start-time" type="text" />

        <button>Submit</button>
      </div>
    `;

    this.shadowRoot.querySelector('button').addEventListener('click', this.handleSubmit.bind(this));
  }

  resetForm() {
    const inputFields = this.shadowRoot.querySelectorAll('input');
    inputFields.forEach((field) => {
      field.value = '';
    });
  }

  async handleSubmit() {
    const raceId = 1;
    const data = {
      location_id: 1,
      race_name: this.shadowRoot.querySelector("input[name='race-name']").value,
      race_date: this.shadowRoot.querySelector("input[name='race-date']").value,
      check_in_open_time: this.shadowRoot.querySelector("input[name='check-in-open-time']").value,
      race_start_time: this.shadowRoot.querySelector("input[name='race-start-time']").value,
    };

    try {
      const response = await fetch('/api/race', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('API request failed');
    } catch (error) {
      localStore.setItem('race', [data]);
    } finally {
      this.resetForm();
      window.location.href = `/app/organise/race?&id=${raceId}`;
    }
  }
}

customElements.define('create-race-form', CreateRaceForm);
