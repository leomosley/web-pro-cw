import { templates } from '../../index.mjs';

class RaceList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._races = [];
  }

  set races(value) {
    if (!Array.isArray(value)) {
      return;
    }
    this._races = value;
    this.render();
  }

  get races() {
    return this._races;
  }

  connectedCallback() {
    this.render();
    this.role = this.getAttribute('role');
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ul {
          list-style: none;
          padding: 0;
        }
      </style>
      <ul id="race-list"></ul>
    `;

    const list = this.shadowRoot.querySelector('ul');

    if (this._races.length === 0) {
      const noRacesMessage = document.createElement('p');
      noRacesMessage.textContent = 'No races available.';
      list.append(noRacesMessage);
      return;
    }

    for (const race of this._races) {
      const item = templates.raceListItem.content.cloneNode(true);

      item.querySelector('.race-name').textContent = race.race_name;
      item.querySelector('.race-date').textContent = `Date: ${race.race_date}`;
      item.querySelector('.race-time').textContent = `Check-in: ${race.check_in_open_time}, Start: ${race.race_start_time}`;
      item.querySelector('.race-location').textContent = [
        race.address_line_1,
        race.address_line_2,
        race.city,
        race.postcode,
      ].filter(Boolean).join(', ');
      item.querySelector('.race-link').textContent = 'View Details';


      const url = `/app/${this.role === 'organiser' ? 'organise' : 'view'}/race?id=${race.race_id}`;
      item.querySelector('.race-link').setAttribute('href', url);

      list.append(item);
    }
  }
}

customElements.define('race-list', RaceList);
