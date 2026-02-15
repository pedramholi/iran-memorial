import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Iran Memorial",
    default: "Iran Memorial — Every Victim Has a Name",
  },
  description:
    "A living memorial for the victims of the Islamic Republic of Iran (1979–present). Documenting every life lost to state violence.",
  metadataBase: new URL("https://memorial.n8ncloud.de"),
  openGraph: {
    siteName: "Iran Memorial",
    type: "website",
    locale: "en_US",
    alternateLocale: ["fa_IR", "de_DE"],
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
