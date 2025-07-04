// This file contains the brands that are used in the app.

// API brand names -> brand names
export const brandNames = {
  kodak: ["Kodak", "Eastman"],
  fuji: ["Fuji", "Fujifilm"],
  ilford: ["Ilford", "Kentmere"],
  cinestill: ["Cinestill"],
  lomography: ["Lomography"],
  rollei: ["Rollei"],
  adox: ["Adox"],
  agfa: ["Agfa", "AgfaPhoto"],
  arista: ["Arista"],
  efke: ["EFKE"],
  fomapan: ["Fomapan", "Foma"],
  holga: ["Holga"],
  generic: [
    "CatLABS",
    "Ultrafine",
    "Silberra",
    "Lucky",
    "Yodica",
    "Street Candy Film",
    "Shanghai Film",
    "Bergger",
    "FPP",
    "JCH",
    "Kono",
    "Psychedelic Blues",
    "Revolog",
    "Yodica",
    "Dubblefilm",
    "Legacy Pro",
    "Washi",
    "Oriental",
  ],
};

export const brandThemeColorMapping = {
  kodak: "kodakBrandColor",
  fuji: "fujiBrandColor",
  ilford: "ilfordBrandColor",
  cinestill: "cinestillBrandColor",
  lomography: "lomographyBrandColor",
  rollei: "rolleiBrandColor",
  adox: "adoxBrandColor",
  agfa: "agfaBrandColor",
  arista: "aristaBrandColor",
  efke: "efkeBrandColor",
  fomapan: "fomapanBrandColor",
  holga: "holgaBrandColor",
  generic: "genericBrandColor",
};

// Film type colors for categorization
export const filmTypeColors: Record<string, string> = {
  "black and white": "#2c3e50",
  "b&w": "#2c3e50",
  "color negative": "#e74c3c",
  color: "#e74c3c",
  slide: "#f39c12",
  reversal: "#f39c12",
  instant: "#9b59b6",
  specialty: "#34495e",
  infrared: "#8e44ad",
  chromogenic: "#16a085",
};

// Developer type colors
export const developerTypeColors: Record<string, string> = {
  "black and white": "#2c3e50",
  "b&w": "#2c3e50",
  color: "#e74c3c",
  c41: "#e74c3c",
  e6: "#f39c12",
  monobath: "#16a085",
  specialty: "#34495e",
};

/**
 * Get the normalized brand key for a given brand name
 */
export function getBrandKey(brandName: string): string {
  const normalized = brandName.toLowerCase().trim();

  for (const [key, aliases] of Object.entries(brandNames)) {
    if (aliases.some((alias) => normalized.includes(alias.toLowerCase()))) {
      return key;
    }
  }

  return "generic";
}

/**
 * Get type color for film type
 */
export function getFilmTypeColor(type?: string): string {
  const normalizedType = (type ?? "").toLowerCase().trim();
  return filmTypeColors[normalizedType] || filmTypeColors["black and white"];
}

/**
 * Get type color for developer type
 */
export function getDeveloperTypeColor(type: string): string {
  const normalizedType = type.toLowerCase().trim();
  return (
    developerTypeColors[normalizedType] ||
    developerTypeColors["black and white"]
  );
}

/**
 * Check if a color is light (for determining text color)
 */
export function isLightColor(color: string): boolean {
  // Remove # if present
  const hex = color.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5;
}

/**
 * Get contrasting text color (black or white) for a background color
 */
export function getContrastingTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? "#000000" : "#ffffff";
}
