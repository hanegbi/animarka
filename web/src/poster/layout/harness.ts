import { hash01 } from "@/poster/state/random";
import type { LabelMode } from "@/poster/state/types";
import { boxInside, boxesOverlap, unionBox } from "./clamp";
import type { Box, LayoutAnimal, LayoutInput, LayoutResult } from "./types";

/** Test helpers shared by the layout tests. */

export function makeAnimals(n: number, salt = 1): LayoutAnimal[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `bird-${i}`,
    // 0.35 (tall heron) to 1.9 (long duck)
    aspect: 0.35 + hash01(`a${i}-${salt}`) * 1.55,
    // 8 g to 9 kg, log spread
    massG: 8 * Math.pow(1125, hash01(`m${i}-${salt}`)),
  }));
}

export const ASPECTS = [
  0.6,
  2 / 3,
  0.7071,
  0.75,
  0.8,
  1 / 0.8,
  1 / 0.7071,
  4 / 3,
];
export const COUNTS = [1, 2, 3, 4, 5, 7, 12, 20, 36, 37, 75, 76, 100, 150];
export const MODES: LabelMode[] = ["names", "legend", "none"];

export function inputFor(
  n: number,
  frameAspect: number,
  labels: LabelMode,
  extra: Partial<LayoutInput> = {},
): LayoutInput {
  return { animals: makeAnimals(n), frameAspect, labels, seed: 7, ...extra };
}

export function blockOf(item: LayoutResult["items"][number]): Box {
  return unionBox(item.art, item.label, item.number);
}

/** Returns a list of problems. Empty means the layout obeys every rule. */
export function problems(result: LayoutResult, input: LayoutInput): string[] {
  const out: string[] = [];
  const { frame, items } = result;
  const n = input.animals.length;
  if (items.length !== n) out.push(`expected ${n} items, got ${items.length}`);

  const seen = new Set<string>();
  items.forEach((it) => {
    if (seen.has(it.id)) out.push(`duplicate ${it.id}`);
    seen.add(it.id);
    const animal = input.animals.find((a) => a.id === it.id);
    if (!animal) return out.push(`unknown ${it.id}`);
    if (it.index !== input.animals.indexOf(animal))
      out.push(`${it.id} wrong index`);
    if (!(it.art.w > 0 && it.art.h > 0)) out.push(`${it.id} has no size`);
    if (Math.abs(it.art.w / it.art.h - animal.aspect) > 1e-6)
      out.push(`${it.id} aspect changed`);
    if (input.labels === "names" && !it.label)
      out.push(`${it.id} missing label`);
    if (input.labels === "legend" && !it.number)
      out.push(`${it.id} missing number`);
    if (input.labels !== "names" && it.label)
      out.push(`${it.id} unexpected label`);
    if (input.labels !== "legend" && it.number)
      out.push(`${it.id} unexpected number`);
    for (const [name, box] of [
      ["art", it.art],
      ["label", it.label],
      ["number", it.number],
    ] as const) {
      if (!box) continue;
      if (!boxInside(box, frame.safe))
        out.push(`${it.id} ${name} leaves the safe frame`);
      if (!boxInside(box, frame.area))
        out.push(`${it.id} ${name} leaves the animal area`);
      if (boxesOverlap(box, frame.title))
        out.push(`${it.id} ${name} touches the title`);
      if (frame.legend && boxesOverlap(box, frame.legend.box))
        out.push(`${it.id} ${name} touches the legend`);
    }
    if (it.label && boxesOverlap(it.art, it.label))
      out.push(`${it.id} label covers its art`);
    if (it.number && boxesOverlap(it.art, it.number))
      out.push(`${it.id} number covers its art`);
  });

  const blocks = items.map(blockOf);
  for (let a = 0; a < blocks.length; a++) {
    for (let b = a + 1; b < blocks.length; b++) {
      if (boxesOverlap(blocks[a], blocks[b]))
        out.push(`${items[a].id} overlaps ${items[b].id}`);
    }
  }
  return out;
}
