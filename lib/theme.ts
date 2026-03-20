export const THEME_STORAGE_KEY = "calliope-theme";
export const DEFAULT_THEME = "dark" as const;
export const THEMES = ["light", "dark"] as const;

export type Theme = (typeof THEMES)[number];

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}
