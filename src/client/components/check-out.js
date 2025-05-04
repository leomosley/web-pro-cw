class CheckOut extends HTMLElement {
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
      <label for="position">Position</label>
      <input name="position" type="number" />
    `;

    const button = document.createElement('button');
    button.textContent = 'Check Out';
    button.addEventListener('click', this.handleClick.bind(this));
    this.shadowRoot.appendChild(button);
  }

  handleClick(event) {
    // TODO: undo after CheckOut (toggle CheckOut of last pid)
    const particpantId = this.shadowRoot.querySelector('input[name="pid"').value;
    const position = this.shadowRoot.querySelector('input[name="position"]').value;
    const raceId = this.getAttribute('raceId');
    console.log('pid', particpantId, 'position', position, 'raceId', raceId);
  }
}

customElements.define('check-out', CheckOut);
