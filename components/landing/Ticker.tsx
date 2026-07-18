const ITEMS = [
  "Moins d'appels",
  "Devis signés en ligne",
  "Photos horodatées",
  "Zéro litige",
  "Client rassuré",
  "Suivi en temps réel",
  "Aucune application",
  "Preuve à l'appui",
];

export function Ticker() {
  const suite = [...ITEMS, ...ITEMS];
  return (
    <div className="mask-fade-x overflow-hidden border-y border-white/10 bg-asphalt-900 py-4">
      <div className="flex w-max animate-marquee items-center gap-8">
        {suite.map((item, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="whitespace-nowrap font-mono text-sm font-medium uppercase tracking-[0.2em] text-white/45">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
          </div>
        ))}
      </div>
    </div>
  );
}
