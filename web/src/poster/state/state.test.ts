import { describe, expect, it } from "vitest";
import { fakeCatalog, fakeCtx } from "./fixtures";
import { apply, createHistory, HISTORY_LIMIT, redo, undo } from "./history";
import { effectiveMirror } from "./mirror";
import { initialState, reduce, surprisePick } from "./reducer";
import { loadState, sanitize, saveState, STORAGE_KEY } from "./storage";
import { createPosterStore } from "./store";
import type { PosterAction, PosterState } from "./types";

const start = (order: string[] = []) => initialState(fakeCtx, order);
const run = (s: PosterState, ...actions: PosterAction[]) =>
  actions.reduce((acc, a) => reduce(acc, a, fakeCtx), s);

describe("selection actions", () => {
  it("toggle adds and removes", () => {
    const on = run(start(), { type: "toggle", id: "a" });
    expect(on.order).toEqual(["a"]);
    expect(run(on, { type: "toggle", id: "a" }).order).toEqual([]);
  });

  it("toggle ignores unknown ids", () => {
    const s = start();
    expect(reduce(s, { type: "toggle", id: "zzz" }, fakeCtx)).toBe(s);
  });

  it("addMany skips duplicates and unknown ids, keeps order", () => {
    const s = run(start(["a"]), {
      type: "addMany",
      ids: ["b", "a", "zzz", "b", "c"],
    });
    expect(s.order).toEqual(["a", "b", "c"]);
  });

  it("addMany with nothing new returns the same state", () => {
    const s = start(["a"]);
    expect(reduce(s, { type: "addMany", ids: ["a"] }, fakeCtx)).toBe(s);
  });

  it("removeMany removes only the listed ones", () => {
    expect(
      run(start(["a", "b", "c"]), { type: "removeMany", ids: ["a", "c"] })
        .order,
    ).toEqual(["b"]);
  });

  it("replaceWith sets exactly the list and resets mirrors", () => {
    const s = run(
      start(["a", "b"]),
      { type: "mirror", id: "a" },
      { type: "replaceWith", ids: ["c", "d"] },
    );
    expect(s.order).toEqual(["c", "d"]);
    expect(s.flip).toEqual({});
  });

  it("clear empties the poster", () => {
    const s = run(start(["a", "b"]), { type: "clear" });
    expect(s.order).toEqual([]);
    expect(s.title).toBe("Birds");
  });

  it("surprise picks the same birds for the same seed", () => {
    const one = run(start(), { type: "surprise", seed: 3 });
    const two = run(start(["a"]), { type: "surprise", seed: 3 });
    expect(one.order).toEqual(two.order);
    expect(one.seed).toBe(3);
  });

  it("surprise count is 12 to 16 when the catalog is big enough", () => {
    const ids = Array.from({ length: 100 }, (_, i) => `b${i}`);
    for (let seed = 0; seed < 20; seed++) {
      const n = surprisePick(ids, seed).length;
      expect(n).toBeGreaterThanOrEqual(12);
      expect(n).toBeLessThanOrEqual(16);
    }
  });
});

describe("arrangement actions", () => {
  it("swap exchanges two birds", () => {
    expect(
      run(start(["a", "b", "c"]), { type: "swap", a: "a", b: "c" }).order,
    ).toEqual(["c", "b", "a"]);
  });

  it("swap with a missing bird or itself does nothing", () => {
    const s = start(["a", "b"]);
    expect(reduce(s, { type: "swap", a: "a", b: "zzz" }, fakeCtx)).toBe(s);
    expect(reduce(s, { type: "swap", a: "a", b: "a" }, fakeCtx)).toBe(s);
  });

  it("move shifts one step and stops at the ends", () => {
    const s = start(["a", "b", "c"]);
    expect(run(s, { type: "move", id: "a", delta: 1 }).order).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(reduce(s, { type: "move", id: "a", delta: -1 }, fakeCtx)).toBe(s);
    expect(reduce(s, { type: "move", id: "c", delta: 1 }, fakeCtx)).toBe(s);
  });

  it("mirror toggles and prunes with the bird", () => {
    const m = run(start(["a", "b"]), { type: "mirror", id: "a" });
    expect(m.flip).toEqual({ a: true });
    expect(run(m, { type: "mirror", id: "a" }).flip).toEqual({});
    expect(run(m, { type: "toggle", id: "a" }).flip).toEqual({});
  });

  it("shuffle is deterministic and keeps the same birds", () => {
    const s = start(["a", "b", "c", "d", "e", "f"]);
    const one = run(s, { type: "shuffle", seed: 5 });
    expect(one.order).toEqual(run(s, { type: "shuffle", seed: 5 }).order);
    expect([...one.order].sort()).toEqual([...s.order].sort());
    expect(one.seed).toBe(5);
  });

  it("shuffle needs two birds", () => {
    const s = start(["a"]);
    expect(reduce(s, { type: "shuffle", seed: 1 }, fakeCtx)).toBe(s);
  });

  it("centerpiece override is kept only while the bird is on the poster", () => {
    const s = run(start(["a", "b"]), { type: "setCenter", id: "b" });
    expect(s.center).toBe("b");
    expect(run(s, { type: "toggle", id: "b" }).center).toBeUndefined();
    expect(reduce(s, { type: "setCenter", id: "zzz" }, fakeCtx)).toBe(s);
  });
});

describe("settings actions", () => {
  it("changes style, labels, layout, background, size, orientation, language", () => {
    const s = run(
      start(),
      { type: "setStyle", style: "wb" },
      { type: "setLabels", labels: "legend" },
      { type: "setLayout", layout: "grid" },
      { type: "setBg", bg: "night" },
      { type: "setSize", size: "2:3" },
      { type: "setOrientation", orientation: "landscape" },
      { type: "setLang", lang: "he" },
    );
    expect(s).toMatchObject({
      style: "wb",
      labels: "legend",
      layout: "grid",
      bg: "night",
      size: "2:3",
      orientation: "landscape",
      lang: "he",
    });
  });

  it("rejects unknown style and background", () => {
    const s = start();
    expect(reduce(s, { type: "setStyle", style: "nope" }, fakeCtx)).toBe(s);
    expect(reduce(s, { type: "setBg", bg: "nope" }, fakeCtx)).toBe(s);
  });

  it("layout change keeps birds, order, mirrors, style, labels and background", () => {
    const before = run(
      start(["a", "b", "c"]),
      { type: "mirror", id: "b" },
      { type: "setStyle", style: "wb" },
      { type: "setLabels", labels: "legend" },
      { type: "setBg", bg: "night" },
    );
    const after = run(before, { type: "setLayout", layout: "centerpiece" });
    expect({ ...after, layout: before.layout }).toEqual(before);
  });
});

describe("automatic title", () => {
  it("one family gives the family name, a mix gives Birds", () => {
    expect(start(["a", "b"]).title).toBe("Owls");
    expect(start(["a", "d"]).title).toBe("Birds");
    expect(start().title).toBe("Birds");
  });

  it("follows the selection until the user edits it", () => {
    let s = start(["a"]);
    expect(s.title).toBe("Owls");
    s = run(s, { type: "toggle", id: "d" });
    expect(s.title).toBe("Birds");
    s = run(s, { type: "setTitle", title: "My garden" });
    expect(s.titleAuto).toBe(false);
    s = run(s, { type: "toggle", id: "d" });
    expect(s.title).toBe("My garden");
  });

  it("clearing the title text resumes the automatic title", () => {
    let s = run(start(["a"]), { type: "setTitle", title: "Mine" });
    s = run(s, { type: "setTitle", title: "  " });
    expect(s.titleAuto).toBe(true);
    expect(s.title).toBe("Owls");
  });
});

describe("mirror rule", () => {
  const st = (flip: Record<string, true>, style: string) => ({ flip, style });

  it("user mirror XOR style faces right", () => {
    // bird d faces right in woodblock
    expect(effectiveMirror(st({}, "fg"), "d", fakeCatalog)).toBe(false);
    expect(effectiveMirror(st({ d: true }, "fg"), "d", fakeCatalog)).toBe(true);
    expect(effectiveMirror(st({}, "wb"), "d", fakeCatalog)).toBe(true);
    expect(effectiveMirror(st({ d: true }, "wb"), "d", fakeCatalog)).toBe(
      false,
    );
  });

  it("front facing birds are never mirrored automatically", () => {
    expect(effectiveMirror(st({}, "wb"), "e", fakeCatalog)).toBe(false);
    expect(effectiveMirror(st({ e: true }, "wb"), "e", fakeCatalog)).toBe(true);
  });
});

describe("history", () => {
  it("undo and redo walk back and forth", () => {
    let h = createHistory(start());
    h = apply(h, { type: "toggle", id: "a" }, fakeCtx);
    h = apply(h, { type: "toggle", id: "b" }, fakeCtx);
    expect(h.present.order).toEqual(["a", "b"]);
    h = undo(h);
    expect(h.present.order).toEqual(["a"]);
    h = redo(h);
    expect(h.present.order).toEqual(["a", "b"]);
  });

  it("a new action clears redo", () => {
    let h = createHistory(start());
    h = apply(h, { type: "toggle", id: "a" }, fakeCtx);
    h = undo(h);
    h = apply(h, { type: "toggle", id: "b" }, fakeCtx);
    expect(h.future).toEqual([]);
    expect(redo(h)).toBe(h);
  });

  it("no-op actions add no undo step", () => {
    const h = createHistory(start(["a"]));
    expect(apply(h, { type: "setLayout", layout: "scatter" }, fakeCtx)).toBe(h);
  });

  it("keeps at least 20 steps", () => {
    expect(HISTORY_LIMIT).toBeGreaterThanOrEqual(20);
    let h = createHistory(start());
    for (let i = 0; i < 60; i++)
      h = apply(h, { type: "toggle", id: i % 2 ? "a" : "b" }, fakeCtx);
    expect(h.past.length).toBe(HISTORY_LIMIT);
    for (let i = 0; i < 25; i++) h = undo(h);
    expect(h.past.length).toBe(HISTORY_LIMIT - 25);
  });

  it("typing a title is one undo step", () => {
    let h = createHistory(start(["a"]));
    for (const t of ["M", "My", "My g", "My garden"])
      h = apply(h, { type: "setTitle", title: t }, fakeCtx);
    expect(h.past.length).toBe(1);
    h = undo(h);
    expect(h.present.title).toBe("Owls");
    expect(h.present.titleAuto).toBe(true);
  });

  it("title typing after another action starts a new step", () => {
    let h = createHistory(start(["a"]));
    h = apply(h, { type: "setTitle", title: "One" }, fakeCtx);
    h = apply(h, { type: "toggle", id: "b" }, fakeCtx);
    h = apply(h, { type: "setTitle", title: "Two" }, fakeCtx);
    expect(h.past.length).toBe(3);
  });

  it("undo restores style, background and layout together", () => {
    let h = createHistory(start(["a"]));
    h = apply(h, { type: "setStyle", style: "wb" }, fakeCtx);
    h = apply(h, { type: "setBg", bg: "night" }, fakeCtx);
    h = undo(undo(h));
    expect(h.present.style).toBe("fg");
    expect(h.present.bg).toBe("cream");
  });
});

describe("storage", () => {
  const memory = () => {
    const data = new Map<string, string>();
    return {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
    };
  };

  it("round trips a state", () => {
    const m = memory();
    const s = run(
      start(["a", "d"]),
      { type: "mirror", id: "d" },
      { type: "setLayout", layout: "grid" },
    );
    saveState(m, s);
    expect(loadState(m, fakeCtx)).toEqual(s);
  });

  it("returns null for missing, broken or foreign data", () => {
    const m = memory();
    expect(loadState(m, fakeCtx)).toBeNull();
    m.setItem(STORAGE_KEY, "{not json");
    expect(loadState(m, fakeCtx)).toBeNull();
    m.setItem(STORAGE_KEY, JSON.stringify({ hello: 1 }));
    expect(loadState(m, fakeCtx)).toBeNull();
    expect(sanitize("text", fakeCtx)).toBeNull();
    expect(sanitize(null, fakeCtx)).toBeNull();
  });

  it("repairs bad fields instead of failing", () => {
    const s = sanitize(
      {
        order: ["a", "a", "zzz", 5, "b"],
        flip: { a: true, zzz: true, c: true },
        center: "c",
        seed: "x",
        title: 42,
        titleAuto: "yes",
        labels: "weird",
        lang: "fr",
        style: "gone",
        bg: "gone",
        layout: "spiral",
        size: "9:9",
        orientation: "sideways",
      },
      fakeCtx,
    )!;
    expect(s.order).toEqual(["a", "b"]);
    expect(s.flip).toEqual({ a: true });
    expect(s.center).toBeUndefined();
    expect(s.seed).toBe(7);
    expect(s.title).toBe("Owls");
    expect(s).toMatchObject({
      labels: "names",
      lang: "en",
      style: "fg",
      bg: "cream",
      layout: "scatter",
      size: "3:4",
      orientation: "portrait",
    });
  });

  it("keeps a custom title", () => {
    const s = sanitize(
      { order: ["a"], title: "Mine", titleAuto: false },
      fakeCtx,
    )!;
    expect(s.title).toBe("Mine");
    expect(s.titleAuto).toBe(false);
  });

  it("survives a storage that throws", () => {
    const bad = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadState(bad, fakeCtx)).toBeNull();
    expect(() => saveState(bad, start())).not.toThrow();
  });
});

describe("store", () => {
  it("autosaves and restores", () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
    };
    const one = createPosterStore(fakeCtx, { storage, starter: ["a"] });
    one.getState().dispatch({ type: "toggle", id: "b" });
    const two = createPosterStore(fakeCtx, { storage, starter: ["f"] });
    expect(two.getState().history.present.order).toEqual(["a", "b"]);
  });

  it("starts from the starter poster when nothing is saved", () => {
    const s = createPosterStore(fakeCtx, { starter: ["a", "zzz", "d"] });
    expect(s.getState().history.present.order).toEqual(["a", "d"]);
  });

  it("undo and redo through the store", () => {
    const s = createPosterStore(fakeCtx, { starter: ["a"] });
    s.getState().dispatch({ type: "toggle", id: "b" });
    s.getState().undo();
    expect(s.getState().history.present.order).toEqual(["a"]);
    s.getState().redo();
    expect(s.getState().history.present.order).toEqual(["a", "b"]);
  });

  it("replace clears undo", () => {
    const s = createPosterStore(fakeCtx, { starter: ["a"] });
    s.getState().dispatch({ type: "toggle", id: "b" });
    s.getState().replace(start(["c"]));
    expect(s.getState().history.past).toEqual([]);
    expect(s.getState().history.present.order).toEqual(["c"]);
  });
});
