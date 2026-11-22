import { Fraunces } from "next/font/google";

/**
 * The landing headline face: Fraunces with its optical size axis, so display sizes get the sharp,
 * high contrast cut. Loaded on the landing page only; the builder keeps the plain weight axis.
 */
export const frauncesDisplay = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-display",
  display: "swap",
});
