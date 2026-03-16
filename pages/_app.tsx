import type { AppProps } from "next/app";

import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { fontSans, fontMono } from "@/config/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { captureException, initializeMonitoring } from "@/lib/monitoring";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    initializeMonitoring();

    const handleError = (event: ErrorEvent) => {
      if (event.error) {
        captureException(event.error, { source: "window.error" });
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error("Unhandled promise rejection");
      captureException(error, { source: "window.unhandledrejection" });
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <HeroUIProvider navigate={router.push}>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </HeroUIProvider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
