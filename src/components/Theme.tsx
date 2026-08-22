"use client";

/**
 * Light/dark control.
 *
 * The palette for both schemes has been in `globals.css` since the first commit
 * and nothing ever set the attribute it keys off, so the site followed the
 * operating system and offered no way to disagree with it. That is a defensible
 * default and a poor total offering: people read on machines whose system theme
 * is not the theme they want for one tab.
 *
 * Three states rather than two, because a boolean toggle silently discards the
 * thing that used to work. "System" is the default and stays live — flip the OS
 * theme with the tab open and the page follows.
 */

import { useCallback, useEffect, useState } from "react";

export type Theme = "system" | "light" | "dark";

const KEY = "kernly.theme";

/**
 * Runs before first paint, inlined into the document head.
 *
 * Without it the server sends light markup, React hydrates, and only then does
 * the stored preference get applied — which a reader on dark sees as a white
 * flash. Reading one string from localStorage is cheap enough to be worth
 * blocking paint for; anything heavier would not be.
 *
 * Everything here is wrapped, because localStorage is not merely empty in a
 * private window or with site data blocked — the accessor itself throws, and an
 * exception in a blocking head script leaves the attribute unset for the whole
 * session.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  KEY,
)});if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})()`;

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}

export function useTheme() {
  // Always "system" on the first render. The stored value is read in an effect
  // rather than in the initialiser, because the server has no localStorage and
  // a first render that disagrees with the server's is a hydration mismatch.
  // The head script has already painted the right colours by this point, so the
  // effect is correcting the control's label, not the page.
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored === "light" || stored === "dark") setTheme(stored);
    } catch {
      /* storage unavailable; system it is */
    }
  }, []);

  const choose = useCallback((next: Theme) => {
    setTheme(next);
    apply(next);
    try {
      if (next === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      /* the choice still applies to this tab, it just will not persist */
    }
  }, []);

  return { theme, choose };
}

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: "light",
    label: "Light",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <circle cx="8" cy="8" r="3.1" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6" />
          <path d="M3.2 3.2l1.1 1.1M11.7 11.7l1.1 1.1M12.8 3.2l-1.1 1.1M4.3 11.7l-1.1 1.1" />
        </g>
      </svg>
    ),
  },
  {
    value: "system",
    label: "System",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <rect
          x="1.8"
          y="2.6"
          width="12.4"
          height="8.6"
          rx="1.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path d="M5.4 13.6h5.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <path
          d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

export function ThemeToggle() {
  const { theme, choose } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour scheme"
      className="flex items-center gap-0.5 rounded-md border border-[var(--line)] p-0.5"
    >
      {OPTIONS.map((o) => {
        const active = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={o.label}
            onClick={() => choose(o.value)}
            className={
              "rounded-[5px] px-1.5 py-1 transition-colors " +
              (active
                ? "bg-[color-mix(in_oklab,var(--fg)_10%,transparent)] text-[var(--fg)]"
                : "text-[var(--muted)] hover:text-[var(--fg)]")
            }
          >
            {o.icon}
            <span className="sr-only">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
