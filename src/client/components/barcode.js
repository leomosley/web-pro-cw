function toBinaryString(string) {
  return string.split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

class Barcode extends HTMLElement {
  constructor() {
    super();
    this.canvas = document.createElement('canvas');
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const value = this.getAttribute('value'); // Get the barcode value from an attribute
    if (!value) {
      console.error('No value attribute provided for barcode.');
      return;
    }

    const withChecksum = `[X]${value}[X]`;

    const binaryString = toBinaryString(withChecksum); // Convert value to binary string
    const ctx = this.canvas.getContext('2d');
    const barWidth = 2; // Width of each barcode bar
    const height = 100; // Height of the barcode

    // Set canvas dimensions
    this.canvas.width = binaryString.length * barWidth; // Width based on binary string length
    this.canvas.height = height;

    // Draw the barcode
    for (let i = 0; i < binaryString.length; i++) {
      ctx.fillStyle = binaryString[i] === '1' ? 'black' : 'white'; // Set bar color
      ctx.fillRect(i * barWidth, 0, barWidth, height); // Draw the bar
    }

    this.appendChild(this.canvas); // Append the canvas to the custom element
  }
}

customElements.define('participant-barcode', Barcode);
