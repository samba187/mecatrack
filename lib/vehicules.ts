/**
 * Base embarquée marques → modèles (marché français), pour l'autocomplétion
 * du formulaire véhicule. Aucune API : filtrage local, instantané, hors-ligne.
 * La saisie libre reste autorisée (un modèle absent de la liste passe quand même).
 */
export const MARQUES: Record<string, string[]> = {
  Renault: ["Clio", "Captur", "Mégane", "Scénic", "Kadjar", "Twingo", "Zoe", "Austral", "Arkana", "Kangoo", "Trafic", "Master", "Laguna", "Espace"],
  Peugeot: ["208", "2008", "308", "3008", "5008", "508", "108", "Partner", "Rifter", "Expert", "Boxer", "207", "206"],
  Citroën: ["C1", "C3", "C3 Aircross", "C4", "C4 Cactus", "C5 Aircross", "C5 X", "Berlingo", "Jumpy", "Jumper", "DS3", "Xsara Picasso"],
  "DS": ["DS3", "DS4", "DS7", "DS9"],
  Volkswagen: ["Polo", "Golf", "Passat", "Tiguan", "T-Roc", "T-Cross", "Touran", "Caddy", "Transporter", "Up", "Arteon", "ID.3", "ID.4"],
  Audi: ["A1", "A3", "A4", "A5", "A6", "Q2", "Q3", "Q5", "Q7", "TT", "e-tron"],
  BMW: ["Série 1", "Série 2", "Série 3", "Série 4", "Série 5", "X1", "X2", "X3", "X5", "i3"],
  "Mercedes-Benz": ["Classe A", "Classe B", "Classe C", "Classe E", "CLA", "GLA", "GLB", "GLC", "Vito", "Sprinter"],
  Toyota: ["Yaris", "Yaris Cross", "Corolla", "C-HR", "RAV4", "Aygo", "Proace", "Hilux", "Prius"],
  Ford: ["Fiesta", "Focus", "Puma", "Kuga", "Mondeo", "Transit", "Transit Custom", "Ranger", "Ka+"],
  Opel: ["Corsa", "Astra", "Mokka", "Crossland", "Grandland", "Zafira", "Combo", "Vivaro", "Insignia"],
  Dacia: ["Sandero", "Duster", "Logan", "Jogger", "Spring", "Lodgy", "Dokker"],
  Fiat: ["500", "500X", "500L", "Panda", "Tipo", "Punto", "Ducato", "Doblo"],
  Nissan: ["Micra", "Juke", "Qashqai", "X-Trail", "Leaf", "Note", "Navara"],
  Hyundai: ["i10", "i20", "i30", "Kona", "Tucson", "Santa Fe", "Ioniq", "Bayon"],
  Kia: ["Picanto", "Rio", "Ceed", "Stonic", "Sportage", "Niro", "Sorento", "EV6"],
  Seat: ["Ibiza", "Leon", "Arona", "Ateca", "Tarraco", "Alhambra"],
  Skoda: ["Fabia", "Octavia", "Scala", "Kamiq", "Karoq", "Kodiaq", "Superb", "Enyaq"],
  "Mini": ["Cooper", "Countryman", "Clubman"],
  Volvo: ["V40", "V60", "V90", "XC40", "XC60", "XC90", "S60"],
  "Alfa Romeo": ["Giulietta", "Giulia", "Stelvio", "MiTo", "Tonale"],
  Suzuki: ["Swift", "Ignis", "Vitara", "S-Cross", "Jimny"],
  Mazda: ["Mazda2", "Mazda3", "CX-3", "CX-30", "CX-5", "MX-5"],
  Honda: ["Jazz", "Civic", "HR-V", "CR-V"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
  Mitsubishi: ["Space Star", "ASX", "Outlander", "Eclipse Cross"],
  Jeep: ["Renegade", "Compass", "Avenger", "Wrangler"],
  "Land Rover": ["Defender", "Discovery", "Range Rover", "Range Rover Evoque"],
  Smart: ["Fortwo", "Forfour"],
  Lexus: ["CT", "UX", "NX", "RX"],
  Cupra: ["Formentor", "Born", "Leon", "Ateca"],
};

export const MARQUES_NOMS = Object.keys(MARQUES).sort((a, b) =>
  a.localeCompare(b, "fr")
);

/** Modèles d'une marque (respecte la casse saisie), ou liste vide si inconnue. */
export function modelesPour(marque: string): string[] {
  const cle = MARQUES_NOMS.find(
    (m) => m.toLowerCase() === marque.trim().toLowerCase()
  );
  return cle ? MARQUES[cle] : [];
}
