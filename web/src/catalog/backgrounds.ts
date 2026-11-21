/**
 * Poster backgrounds, as data. Adding one is a new row here, later a row in the `backgrounds` table.
 * Colors in this file are poster paper, chosen by the user, not interface tokens.
 */
export type Background = {
  id: string;
  name: string;
  kind: "color" | "image";
  /** Paper color. For images, the average color, used while the image loads. */
  color: string;
  /** Web sized image, for the browser. */
  image?: string;
  /** Full size image, for the print render. */
  imageFull?: string;
  /** Dark backgrounds switch the title and labels to light ink. */
  isDark: boolean;
  /** Title and label color on this background. */
  ink: string;
  /** Color of thin rules on this background. */
  rule: string;
};

const LIGHT_RULE = "rgb(0 0 0 / 0.25)";
const DARK_RULE = "rgb(255 255 255 / 0.4)";

export const BACKGROUNDS: Background[] = [
  {
    id: "cream",
    name: "Cream",
    kind: "color",
    color: "#f8f4ea",
    isDark: false,
    ink: "#1e1b16",
    rule: LIGHT_RULE,
  },
  {
    id: "white",
    name: "White",
    kind: "color",
    color: "#ffffff",
    isDark: false,
    ink: "#1e1b16",
    rule: LIGHT_RULE,
  },
  {
    id: "sage",
    name: "Sage",
    kind: "color",
    color: "#e3eadf",
    isDark: false,
    ink: "#1f2a22",
    rule: LIGHT_RULE,
  },
  {
    id: "blush",
    name: "Blush",
    kind: "color",
    color: "#f6e4df",
    isDark: false,
    ink: "#2a1c1a",
    rule: LIGHT_RULE,
  },
  {
    id: "night",
    name: "Night",
    kind: "color",
    color: "#171b22",
    isDark: true,
    ink: "#efe9da",
    rule: DARK_RULE,
  },
  {
    id: "aged",
    name: "Aged paper",
    kind: "image",
    color: "#d6c9ae",
    image: "/backgrounds/aged.webp",
    imageFull: "/backgrounds/full/aged.jpg",
    isDark: false,
    ink: "#2a2014",
    rule: LIGHT_RULE,
  },
  {
    id: "sky",
    name: "Morning sky",
    kind: "image",
    color: "#dfe4e3",
    image: "/backgrounds/sky.webp",
    imageFull: "/backgrounds/full/sky.jpg",
    isDark: false,
    ink: "#1f3347",
    rule: LIGHT_RULE,
  },
  {
    id: "forest",
    name: "Forest",
    kind: "image",
    color: "#254537",
    image: "/backgrounds/forest.webp",
    imageFull: "/backgrounds/full/forest.jpg",
    isDark: true,
    ink: "#f1ecdc",
    rule: DARK_RULE,
  },
];

export const BACKGROUND_BY_ID = new Map(BACKGROUNDS.map((b) => [b.id, b]));

export function backgroundOf(id: string): Background {
  return BACKGROUND_BY_ID.get(id) ?? BACKGROUNDS[0];
}
