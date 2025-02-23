export function toBinaryString(string) {
  return string.split("")
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(" ");
}


export function generateRandomId() {
  // Generate a random uppercase letter (A-Z)
  const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 65);

  // Generate 4 random digits (0-9)
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // Ensures 4 digits

  // Combine the letter and digits
  return randomChar + randomDigits;
}