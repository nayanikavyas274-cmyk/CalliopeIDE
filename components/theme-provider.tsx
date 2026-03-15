"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  DEFAULT_THEME,
  isTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  mounted: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  const documentTheme = document.documentElement.dataset.theme;

  if (isTheme(storedTheme)) {
    return storedTheme;
  }

  if (isTheme(documentTheme)) {
    return documentTheme;
  }

  return document.documentElement.classList.contains("dark") ? "dark" : DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = getInitialTheme();

    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [mounted, theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mounted,
        setTheme: setThemeState,
        toggleTheme: () => {
          setThemeState((currentTheme) =>
            currentTheme === "dark" ? "light" : "dark",
          );
        },
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
