// From ChatGPT
export function adjustHexColor(hex, brightness = 10, saturation = 10) {
  // Remove the "#" symbol if it's included
  hex = hex.replace(/^#/, '');

  // Parse the hex value into its RGB components
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Adjust brightness (you can increase or decrease brightness)
  r += brightness;
  g += brightness;
  b += brightness;

  // Ensure values are within the valid 0-255 range
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  // Convert the adjusted RGB values back to a hex color code
  const adjustedHex = `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;

  return adjustedHex;
}