import type { Metadata } from "next";
import { AppSettingsProvider } from "@/components/providers/settings-provider";
import { DEFAULT_SETTINGS } from "@/lib/default-settings";
import "./globals.css";

export const metadata: Metadata = {
  title: DEFAULT_SETTINGS.app.name,
  description: DEFAULT_SETTINGS.app.description
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={DEFAULT_SETTINGS.app.language}>
      <body>
        <AppSettingsProvider>{children}</AppSettingsProvider>
      </body>
    </html>
  );
}