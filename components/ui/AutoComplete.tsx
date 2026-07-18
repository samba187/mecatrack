"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 h-11 text-[15px] text-ink placeholder:text-slate-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100";

const sansAccent = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/**
 * Champ texte avec liste déroulante qui se réduit à la frappe.
 * Contrôlé (value / onValueChange) et compatible formulaire natif via `name` :
 * la valeur saisie — choisie dans la liste OU libre — est soumise telle quelle.
 */
export function AutoComplete({
  id,
  name,
  options,
  value,
  onValueChange,
  placeholder,
  required,
  autoFocus,
  className,
  maxVisible = 8,
}: {
  id?: string;
  name: string;
  options: string[];
  value: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
  maxVisible?: number;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [surligne, setSurligne] = useState(-1);
  const listboxId = useId();
  const fermetureRef = useRef<ReturnType<typeof setTimeout>>();

  const q = sansAccent(value.trim());
  const filtrees = (
    q ? options.filter((o) => sansAccent(o).includes(q)) : options
  ).slice(0, maxVisible);

  const visible = ouvert && filtrees.length > 0;

  const choisir = (v: string) => {
    onValueChange(v);
    setOuvert(false);
    setSurligne(-1);
  };

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        value={value}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        autoComplete="off"
        role="combobox"
        aria-expanded={visible}
        aria-controls={listboxId}
        aria-autocomplete="list"
        className={cn(inputBase, className)}
        onChange={(e) => {
          onValueChange(e.target.value);
          setOuvert(true);
          setSurligne(-1);
        }}
        onFocus={() => setOuvert(true)}
        onBlur={() => {
          // délai : laisse le clic sur une option se déclencher avant fermeture
          fermetureRef.current = setTimeout(() => setOuvert(false), 120);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOuvert(true);
            setSurligne((i) => Math.min(i + 1, filtrees.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSurligne((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && visible && surligne >= 0) {
            e.preventDefault();
            choisir(filtrees[surligne]);
          } else if (e.key === "Escape") {
            setOuvert(false);
          }
        }}
      />
      {visible && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {filtrees.map((o, i) => (
            <li
              key={o}
              role="option"
              aria-selected={i === surligne}
              className={cn(
                "cursor-pointer px-3.5 py-2 text-[15px] text-ink",
                i === surligne ? "bg-primary-50" : "hover:bg-slate-50"
              )}
              // onMouseDown (pas onClick) pour agir avant le blur de l'input
              onMouseDown={(e) => {
                e.preventDefault();
                clearTimeout(fermetureRef.current);
                choisir(o);
              }}
              onMouseEnter={() => setSurligne(i)}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
