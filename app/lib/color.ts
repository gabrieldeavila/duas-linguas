function getPastelColors(uuid: string, repeat?: number): string[] {
  const hash = uuid.split("-").join(""); // Remove dashes for simplicity
  const colors: string[] = [];

  for (let i = 0; i < (repeat ?? 1); i++) {
    // Use parts of the hash to generate RGB values
    // Use parts of the hash to generate RGB values
    const r = (parseInt(hash.slice(i * 6, i * 6 + 2), 16) % 156) + 100; // Ensure vivid range
    const g = (parseInt(hash.slice(i * 6 + 2, i * 6 + 4), 16) % 156) + 100;
    const b = (parseInt(hash.slice(i * 6 + 4, i * 6 + 6), 16) % 156) + 100;

    // Convert RGB to hex format
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
    colors.push(hex);
  }

  return colors;
}

export default getPastelColors;
