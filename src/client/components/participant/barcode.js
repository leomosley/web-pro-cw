import { toBinaryString } from '../../lib/utils.mjs';

class Barcode extends HTMLElement {
  constructor() {
    super();
    this.canvas = document.createElement('canvas');
  }

  static get observedAttributes() {
    return ['value'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'value' && oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const value = this.getAttribute('value');
    if (!value) {
      return;
    }

    const withChecksum = `[X]${value}[X]`;
    const binaryString = toBinaryString(withChecksum);
    const ctx = this.canvas.getContext('2d');
    const barWidth = 2;
    const height = 100;

    this.canvas.width = binaryString.length * barWidth;
    this.canvas.height = height;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear before redraw

    for (let i = 0; i < binaryString.length; i++) {
      ctx.fillStyle = binaryString[i] === '1' ? 'black' : 'white';
      ctx.fillRect(i * barWidth, 0, barWidth, height);
    }

    if (!this.contains(this.canvas)) {
      this.append(this.canvas);
    }
  }
}

customElements.define('participant-barcode', Barcode);
