export function generateRandomId(prefix) {
  if (!prefix) prefix = String.fromCharCode(Math.floor(Math.random() * 26) + 65);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return prefix + randomDigits;
}