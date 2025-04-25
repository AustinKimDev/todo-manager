/**
 * Generates a random pastel color in HSL format string.
 * @returns {string} CSS HSL color string (e.g., "hsl(120, 70%, 80%)").
 */
export const generatePastelColor = (): string => {
  const hue = Math.floor(Math.random() * 360); // 0 to 359
  const saturation = Math.floor(Math.random() * 31) + 50; // 50% to 80% (Adjust range as needed)
  const lightness = Math.floor(Math.random() * 16) + 75; // 75% to 90% (Adjust range as needed)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};
