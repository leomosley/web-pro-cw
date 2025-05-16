import { templates } from '../../index.mjs';
import {
  getRaceResults,
} from '../../lib/utils.mjs';


class RaceResults extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: 'open',
    });
    this.raceId = new URLSearchParams(window.location.search).get('id');
    this.results = null;
  }

  async connectedCallback() {
    if (!this.raceId) {
      this.renderNotFound();
      return;
    }

    const fetchSuccess = await this.fetchResults();

    if (fetchSuccess) {
      this.render();
    } else {
      this.renderNotFound();
    }
  }

  async fetchResults() {
    const result = await getRaceResults(this.raceId);

    if (!result.success) {
      this.renderNotFound();
      this.results = null;
      return false;
    }

    this.results = result.results;
    return true;
  }

  renderNotFound() {
    this.shadowRoot.innerHTML = 'not-found';
  }

  handleExport() {
    if (!this.results || this.results.length === 0) {
      return;
    }

    const headers = ['Position', 'Finish Time', 'Participant ID'];
    const rows = this.results.map(pos => [
      pos.finish_position,
      pos.finish_time,
      pos.participant_id,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `race_${this.raceId}_results.csv`);
    link.click();

    URL.revokeObjectURL(url);
  }

  render() {
    if (!this.results) {
      return;
    }

    this.shadowRoot.innerHTML = '';
    const template = templates.raceResults.content.cloneNode(true);
    const tbody = template.querySelector('#results-body');

    for (const res of this.results) {
      const row = document.createElement('tr');

      row.innerHTML = `
      <td>${res.finish_position}</td>
      <td>${res.finish_time}</td>
      <td>${res.participant_id}</td>`;

      tbody.append(row);
    }

    const exportButton = template.querySelector('#export');
    exportButton.addEventListener('click', this.handleExport.bind(this));

    this.shadowRoot.append(template);
  }
}

customElements.define('race-results', RaceResults);
