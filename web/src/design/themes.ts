/** Round R1 color directions. Hex values for A to E come from the PRD. Derived roles are marked. */

export type Theme = {
  id: "A" | "B" | "C" | "D" | "E";
  name: string;
  feel: string;
  dark: boolean;
  bg: string;
  surface: string; // derived
  text: string;
  muted: string; // derived
  line: string; // derived
  /** Brand accent exactly as in the PRD. Use for large shapes and graphics. */
  accent: string;
  /** Darkened accent that passes AA for text and button fills. Same as `accent` when it already passes. */
  accentStrong: string;
  onAccent: string;
  /** Second PRD accent, for decoration only unless it passes. */
  second: string;
  secondName: string;
  accentName: string;
  reference: { name: string; url: string };
};

export const THEMES: Theme[] = [
  {
    id: "A",
    name: "Field guide",
    feel: "Natural history book. Matches the prototype.",
    dark: false,
    bg: "#F8F4EA",
    surface: "#FFFFFF",
    text: "#1E1B16",
    muted: "#5E574B",
    line: "#DDD5C2",
    accent: "#2C6B4F",
    accentStrong: "#2C6B4F",
    onAccent: "#F8F4EA",
    second: "#C58B2A",
    secondName: "ochre",
    accentName: "forest",
    reference: {
      name: "Vintage Paper",
      url: "https://21st.dev/community/themes/vintage-paper",
    },
  },
  {
    id: "B",
    name: "Museum night",
    feel: "Dark gallery wall. The poster glows.",
    dark: true,
    bg: "#14171A",
    surface: "#1D2125",
    text: "#EDE8DC",
    muted: "#A8A294",
    line: "#31373D",
    accent: "#B8935A",
    accentStrong: "#B8935A",
    onAccent: "#14171A",
    second: "#EDE8DC",
    secondName: "bone",
    accentName: "brass",
    reference: {
      name: "THURAY Gold Void",
      url: "https://21st.dev/community/themes/thuray-gold-void-1788909549433",
    },
  },
  {
    id: "C",
    name: "Herbarium",
    feel: "Soft, botanical, calm.",
    dark: false,
    bg: "#E7EDE4",
    surface: "#F4F7F2",
    text: "#2F4A3A",
    muted: "#566B5D",
    line: "#C6D2C3",
    accent: "#C4623E",
    accentStrong: "#A65334",
    onAccent: "#FFFFFF",
    second: "#2F4A3A",
    secondName: "moss",
    accentName: "terracotta",
    reference: {
      name: "Sage Garden",
      url: "https://21st.dev/community/themes/sage-garden",
    },
  },
  {
    id: "D",
    name: "Coastal",
    feel: "Clean, airy, modern.",
    dark: false,
    bg: "#F3F6F7",
    surface: "#FFFFFF",
    text: "#1F3347",
    muted: "#58687A",
    line: "#D5DEE3",
    accent: "#4F86A6",
    accentStrong: "#437592",
    onAccent: "#FFFFFF",
    second: "#D9C7A3",
    secondName: "sand",
    accentName: "heron blue",
    reference: {
      name: "Cumulant Navy",
      url: "https://21st.dev/community/themes/cumulant-navy-1788310774807",
    },
  },
  {
    id: "E",
    name: "Playroom",
    feel: "Friendly. Aimed at kids' rooms.",
    dark: false,
    bg: "#FFF8EC",
    surface: "#FFFFFF",
    text: "#22223B",
    muted: "#5B5B73",
    line: "#EADFCB",
    accent: "#F2695C",
    accentStrong: "#BA4F44",
    onAccent: "#FFFFFF",
    second: "#5BB7DB",
    secondName: "sky",
    accentName: "coral",
    reference: {
      name: "Coral Blush",
      url: "https://21st.dev/community/themes/coral-blush",
    },
  },
];
