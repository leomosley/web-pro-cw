class CheckIn extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <label for="pid">Participant ID</label>
      <input name="pid" placeholder="PXXXXX" type="text" />
    `;

    const button = document.createElement('button');
    button.textContent = 'Check In';
    button.addEventListener('click', this.handleClick.bind(this));
    this.shadowRoot.appendChild(button);
  }

  handleClick(event) {
    // TODO: undo after checkIn (toggle checkIn of last pid)
    const pid = this.shadowRoot.querySelector('input').value;
    const raceId = this.getAttribute('race-id');
    console.log('pid', pid, 'race-id', raceId);
  }
}

customElements.define('check-in', CheckIn);
