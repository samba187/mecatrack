/**
 * Génère une fausse photo d'atelier (SVG en data-URI) pour le mode démo.
 * Évite toute dépendance à des images externes.
 */
export function photoPlaceholder(label: string, hue = 215): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue},25%,28%)"/>
      <stop offset="1" stop-color="hsl(${hue},30%,16%)"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <circle cx="400" cy="270" r="110" fill="none" stroke="hsl(${hue},20%,45%)" stroke-width="14"/>
  <circle cx="400" cy="270" r="42" fill="hsl(${hue},20%,40%)"/>
  <g stroke="hsl(${hue},20%,45%)" stroke-width="14">
    <line x1="400" y1="160" x2="400" y2="200"/>
    <line x1="400" y1="340" x2="400" y2="380"/>
    <line x1="290" y1="270" x2="330" y2="270"/>
    <line x1="470" y1="270" x2="510" y2="270"/>
  </g>
  <text x="400" y="470" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="hsl(${hue},15%,72%)">${label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")}</text>
  <text x="400" y="510" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="hsl(${hue},15%,55%)">Photo de démonstration</text>
</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
