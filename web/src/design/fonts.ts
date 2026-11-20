import {
  DM_Sans,
  DM_Serif_Display,
  Frank_Ruhl_Libre,
  Fraunces,
  Heebo,
  IBM_Plex_Sans,
  IBM_Plex_Sans_Hebrew,
  Inter,
  Nunito_Sans,
  Playfair_Display,
  Source_Sans_3,
  Spectral,
  Young_Serif,
} from "next/font/google";

const fraunces = Fraunces({
  display: "swap",
  subsets: ["latin"],
  variable: "--f-fraunces",
});
const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--f-inter",
});
const playfair = Playfair_Display({
  display: "swap",
  subsets: ["latin"],
  variable: "--f-playfair",
});
const sourceSans = Source_Sans_3({
  display: "swap",
  subsets: ["latin"],
  variable: "--f-source-sans",
});
const spectral = Spectral({
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--f-spectral",
});
const plex = IBM_Plex_Sans({
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--f-plex",
});
const dmSerif = DM_Serif_Display({
  display: "swap",
  subsets: ["latin"],
  weight: "400",
  variable: "--f-dm-serif",
});
const dmSans = DM_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--f-dm-sans",
});
const youngSerif = Young_Serif({
  display: "swap",
  subsets: ["latin"],
  weight: "400",
  variable: "--f-young-serif",
});
const nunito = Nunito_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--f-nunito",
});
const plexHe = IBM_Plex_Sans_Hebrew({
  display: "swap",
  subsets: ["hebrew"],
  weight: ["400", "500", "600"],
  variable: "--f-plex-he",
});
// Hebrew companions, because none of the Latin families above carry Hebrew glyphs.
const frank = Frank_Ruhl_Libre({
  display: "swap",
  subsets: ["hebrew"],
  variable: "--f-frank",
});
const heebo = Heebo({
  display: "swap",
  subsets: ["hebrew"],
  variable: "--f-heebo",
});

export const FONT_VARIABLE_CLASSES = [
  plexHe,
  fraunces,
  inter,
  playfair,
  sourceSans,
  spectral,
  plex,
  dmSerif,
  dmSans,
  youngSerif,
  nunito,
  frank,
  heebo,
]
  .map((f) => f.variable)
  .join(" ");

export type Pairing = {
  id: number;
  name: string;
  display: string; // CSS font-family for headings and the poster title
  body: string; // CSS font-family for the interface
  displayName: string;
  bodyName: string;
  hebrewDisplay: string;
  hebrewBody: string;
  note: string;
  strength: string;
  weakness: string;
};

export const PAIRINGS: Pairing[] = [
  {
    id: 1,
    name: "Fraunces and Inter",
    displayName: "Fraunces",
    bodyName: "Inter",
    display: "var(--f-fraunces), var(--f-frank), Georgia, serif",
    body: "var(--f-inter), var(--f-heebo), system-ui, sans-serif",
    hebrewDisplay: "Frank Ruhl Libre",
    hebrewBody: "Heebo",
    note: "A soft, wonky serif with real personality, over the most readable interface sans.",
    strength: "Warm headings and very clean small text.",
    weakness:
      "Fraunces is a variable font with a large file, so the title needs subsetting.",
  },
  {
    id: 2,
    name: "Playfair Display and Source Sans 3",
    displayName: "Playfair Display",
    bodyName: "Source Sans 3",
    display: "var(--f-playfair), var(--f-frank), Georgia, serif",
    body: "var(--f-source-sans), var(--f-heebo), system-ui, sans-serif",
    hebrewDisplay: "Frank Ruhl Libre",
    hebrewBody: "Heebo",
    note: "High contrast display serif, like a printed plate title, with a neutral humanist sans.",
    strength: "The most 'museum plate' look of the five.",
    weakness:
      "Thin hairlines get faint at small sizes and on dark backgrounds.",
  },
  {
    id: 3,
    name: "Spectral and IBM Plex Sans",
    displayName: "Spectral",
    bodyName: "IBM Plex Sans",
    display: "var(--f-spectral), var(--f-frank), Georgia, serif",
    body: "var(--f-plex), var(--f-plex-he), system-ui, sans-serif",
    hebrewDisplay: "Frank Ruhl Libre",
    hebrewBody: "IBM Plex Sans Hebrew",
    note: "The pair the prototype uses. Calm bookish serif, technical sans.",
    strength: "Already proven in the prototype. Plex ships a matching Hebrew.",
    weakness: "Plainest of the five. Less character in the poster title.",
  },
  {
    id: 4,
    name: "DM Serif Display and DM Sans",
    displayName: "DM Serif Display",
    bodyName: "DM Sans",
    display: "var(--f-dm-serif), var(--f-frank), Georgia, serif",
    body: "var(--f-dm-sans), var(--f-heebo), system-ui, sans-serif",
    hebrewDisplay: "Frank Ruhl Libre",
    hebrewBody: "Heebo",
    note: "Bold, friendly display serif with a geometric sans from the same family.",
    strength: "Strong titles that read well at poster scale.",
    weakness: "Display font has one weight, so no bold or italic for emphasis.",
  },
  {
    id: 5,
    name: "Young Serif and Nunito Sans",
    displayName: "Young Serif",
    bodyName: "Nunito Sans",
    display: "var(--f-young-serif), var(--f-frank), Georgia, serif",
    body: "var(--f-nunito), var(--f-heebo), system-ui, sans-serif",
    hebrewDisplay: "Frank Ruhl Libre",
    hebrewBody: "Heebo",
    note: "Chunky, rounded serif with soft rounded sans. Playful.",
    strength: "Fits the Playroom theme and kids' posters best.",
    weakness: "Too casual for the Field guide and Museum night themes.",
  },
];
