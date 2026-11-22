import type { Metadata } from "next";
import { Landing } from "@/landing/Landing";

const description =
  "Pick birds from 11,011 species, choose an illustrated style, and arrange them your way. Free, in your browser, no sign up.";

export const metadata: Metadata = {
  title: "animarka: illustrated bird posters, made by you",
  description,
  openGraph: {
    title: "Every bird you love, on one poster.",
    description,
    images: [
      {
        url: "/landing/og.jpg",
        width: 1200,
        height: 630,
        alt: "Three illustrated bird posters",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/landing/og.jpg"] },
};

export default function Home() {
  return <Landing />;
}
