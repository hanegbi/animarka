import type { LabelMode } from "@/poster/state/types";

/**
 * Layout units: percent of the poster width. A 3:4 portrait poster is 100 wide and 133.33 tall.
 * Layouts never touch the DOM, so the browser and the print render get identical boxes.
 */
export type Box = { x: number; y: number; w: number; h: number };

export type LayoutAnimal = {
  id: string;
  massG: number;
  /** Width over height of the trimmed art. Same box in both styles, see PLAN.md. */
  aspect: number;
};

export type LayoutInput = {
  animals: LayoutAnimal[];
  /** Poster width over height, after orientation. */
  frameAspect: number;
  labels: LabelMode;
  seed: number;
  /** Centerpiece override. */
  center?: string;
};

export type Placed = {
  id: string;
  /** Position in the input list. Legend numbers are index + 1. */
  index: number;
  /** The art box. */
  art: Box;
  /** Name label box, when labels are names. */
  label?: Box;
  /** Number badge box, when labels are numbers. */
  number?: Box;
  /** Font size for the label or number, in layout units. */
  font: number;
};

export type LegendPlan = {
  box: Box;
  cols: number;
  rows: number;
  font: number;
  rowHeight: number;
};

export type Frame = {
  w: number;
  h: number;
  /** Nothing may leave this box. */
  safe: Box;
  title: Box;
  legend?: LegendPlan;
  /** Free space for animals. Inside safe, clear of the title and the legend. */
  area: Box;
};

export type LayoutResult = {
  frame: Frame;
  items: Placed[];
  /** Base label font. Individual items carry their own in `font`. */
  nameFont: number;
};

export type LayoutFn = (input: LayoutInput) => LayoutResult;
