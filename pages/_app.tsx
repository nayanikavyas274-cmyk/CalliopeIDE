import type { AppProps } from "next/app";

import { HeroUIProvider } from "@heroui/system";
import { useRouter } from "next/router";

import { fontSans, fontMono } from "@/config/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <ErrorBoundary>
      <HeroUIProvider navigate={router.push}>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </HeroUIProvider>
    </ErrorBoundary>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
