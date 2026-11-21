import type { Metadata } from "next";
import { Frank_Ruhl_Libre, Fraunces, Heebo, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
// Hebrew companions. Not preloaded, so English visitors do not pay for them.
const heebo = Heebo({
  subsets: ["hebrew"],
  variable: "--font-heebo",
  display: "swap",
  preload: false,
});
const frank = Frank_Ruhl_Libre({
  subsets: ["hebrew"],
  variable: "--font-frank",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "animarka",
  description: "Build your own wildlife poster.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${heebo.variable} ${frank.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
