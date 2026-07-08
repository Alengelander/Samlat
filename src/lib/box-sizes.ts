// Feste Kistengroessen mit hinterlegten Massen (B x H x T in cm).
export type BoxSizeKey = "S" | "M" | "L" | "XL";

export interface BoxSize {
  key: BoxSizeKey;
  label: string;
  dimensions: string; // "B x H x T"
}

export const BOX_SIZES: BoxSize[] = [
  { key: "S", label: "Klein", dimensions: "30 x 20 x 15 cm" },
  { key: "M", label: "Mittel", dimensions: "40 x 30 x 25 cm" },
  { key: "L", label: "Groß", dimensions: "60 x 40 x 35 cm" },
  { key: "XL", label: "Sehr groß", dimensions: "80 x 50 x 45 cm" },
];

export const BOX_SIZE_KEYS = BOX_SIZES.map((s) => s.key);

export function getBoxSize(key: string): BoxSize {
  return BOX_SIZES.find((s) => s.key === key) ?? BOX_SIZES[1];
}
