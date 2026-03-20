"use client";

import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, mounted, toggleTheme } = useTheme();
  const activeTheme = mounted ? theme : "dark";
  const nextTheme = activeTheme === "dark" ? "light" : "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "h-10 w-10 rounded-full border-border/80 bg-background/75 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      aria-label={`Switch to ${nextTheme} theme`}
      aria-pressed={activeTheme === "dark"}
      data-testid="theme-toggle"
    >
      {activeTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      <span className="sr-only">Switch to {nextTheme} theme</span>
    </Button>
  );
}
