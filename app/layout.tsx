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
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
