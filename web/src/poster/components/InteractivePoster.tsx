/* eslint-disable @next/next/no-img-element */
"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { artSrc, displayName } from "@/catalog/species-view";
import { keyToAction } from "@/poster/interactions";
import { hopTurn } from "@/poster/motion";
import { Poster, type AnimalShellProps, type PosterProps } from "./Poster";

type Handlers = {
  onMirror: (id: string) => void;
  onRemove: (id: string) => void;
  onSwap: (a: string, b: string) => void;
  onMove: (id: string, delta: 1 | -1) => void;
};

/** While a bird is dragged over another, that one slides to the dragged bird's place (R8 E3). */
type Preview = { id: string; dx: number; dy: number } | null;

type Ctx = Handlers & {
  activeId: string | null;
  preview: Preview;
  /** Birds that jump to their new place with no transition, right after a drop. */
  settling: Set<string>;
  mirror: (id: string) => void;
  suppressClick: { current: boolean };
};
const ShellContext = createContext<Ctx | null>(null);

const shellOf = (id: string) =>
  document.querySelector<HTMLElement>(`[data-animal="${CSS.escape(id)}"]`);

/**
 * One bird on the poster. Tap it to mirror it, with a short hop and turn. Drag it onto another bird to
 * swap places. Enter or Space mirrors, Delete removes, arrow keys move it through the poster order.
 */
function InteractiveShell({
  id,
  name,
  mirrored,
  style,
  children,
}: AnimalShellProps) {
  const ctx = useContext(ShellContext)!;
  const drag = useDraggable({ id });
  const drop = useDroppable({ id });
  const setRefs = useCallback(
    (el: HTMLElement | null) => {
      drag.setNodeRef(el);
      drop.setNodeRef(el);
    },
    [drag, drop],
  );

  const dragging = ctx.activeId === id;
  const preview = ctx.preview?.id === id ? ctx.preview : null;
  const settling = ctx.settling.has(id);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const action = keyToAction(e.key);
    if (!action) return;
    e.preventDefault();
    if (action.type === "mirror") ctx.mirror(id);
    else if (action.type === "remove") ctx.onRemove(id);
    else ctx.onMove(id, action.delta);
  };

  return (
    <div
      ref={setRefs}
      {...drag.attributes}
      {...drag.listeners}
      role="button"
      aria-roledescription="draggable bird"
      aria-label={`${name}. Press Enter to mirror it. Arrow keys move it. Delete removes it. Drag it onto another bird to swap.`}
      tabIndex={0}
      className="poster-animal focus-visible:ring-ring absolute cursor-grab rounded-[1cqw] outline-none focus-visible:ring-2 active:cursor-grabbing"
      style={{
        ...style,
        touchAction: "none",
        opacity: dragging ? 0 : 1,
        transform: preview
          ? `translate(${preview.dx}px, ${preview.dy}px)`
          : undefined,
        transition: settling ? "none" : style.transition,
        zIndex: preview ? 1 : undefined,
      }}
      onClick={() => {
        if (ctx.suppressClick.current) return;
        ctx.mirror(id);
      }}
      onKeyDown={onKeyDown}
      data-animal={id}
      data-mirrored={mirrored ? "true" : "false"}
      data-drop-target={preview ? "true" : undefined}
    >
      {children}
    </div>
  );
}

type Floating = {
  id: string;
  width: number;
  height: number;
  mirrored: boolean;
} | null;

export function InteractivePoster(props: PosterProps & Handlers) {
  const { onMirror, onRemove, onSwap, onMove, state, species, ...poster } =
    props;
  const [floating, setFloating] = useState<Floating>(null);
  const [preview, setPreview] = useState<Preview>(null);
  const [settling, setSettling] = useState<Set<string>>(() => new Set());
  const suppressClick = useRef(false);

  // A small movement threshold keeps a plain tap a tap, so tap can mirror and drag can swap.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const nameOf = useCallback(
    (id: string | number) => {
      const s = species.get(String(id));
      return s ? displayName(s, state.lang) : String(id);
    },
    [species, state.lang],
  );

  const mirror = useCallback(
    (id: string) => {
      onMirror(id);
      hopTurn(shellOf(id)?.querySelector("[data-art]"));
    },
    [onMirror],
  );

  const onDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    const shell = shellOf(id);
    const art = shell
      ?.querySelector<HTMLElement>("[data-art]")
      ?.getBoundingClientRect();
    suppressClick.current = true;
    setFloating({
      id,
      width: art?.width ?? 80,
      height: art?.height ?? 100,
      mirrored: shell?.getAttribute("data-mirrored") === "true",
    });
  };

  const onDragOver = (e: DragOverEvent) => {
    const active = String(e.active.id);
    const over = e.over ? String(e.over.id) : null;
    if (!over || over === active) {
      setPreview(null);
      return;
    }
    const a = shellOf(active)?.getBoundingClientRect();
    const b = shellOf(over)?.getBoundingClientRect();
    if (!a || !b) return;
    // Centre on centre, so birds of different sizes trade places cleanly.
    setPreview({
      id: over,
      dx: a.left + a.width / 2 - (b.left + b.width / 2),
      dy: a.top + a.height / 2 - (b.top + b.height / 2),
    });
  };

  const endDrag = () => {
    setFloating(null);
    setPreview(null);
    // The click that follows a drag must not mirror the bird.
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 60);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const active = String(e.active.id);
    const over = e.over ? String(e.over.id) : null;
    endDrag();
    if (!over || over === active) return;
    // Both birds are already where they belong (the preview moved one, the drop the other), so
    // they take their new places with no transition, then motion comes back on.
    setSettling(new Set([active, over]));
    onSwap(active, over);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setSettling(new Set())),
    );
  };

  const ctx = useMemo<Ctx>(
    () => ({
      onMirror,
      onRemove,
      onSwap,
      onMove,
      activeId: floating?.id ?? null,
      preview,
      settling,
      mirror,
      suppressClick,
    }),
    [onMirror, onRemove, onSwap, onMove, floating, preview, settling, mirror],
  );

  const sp = floating ? species.get(floating.id) : undefined;

  return (
    <ShellContext.Provider value={ctx}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={endDrag}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              "Press Enter to mirror this bird. Press an arrow key to move it through the poster order. Press Delete to remove it.",
          },
          announcements: {
            onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}.`,
            onDragOver: ({ active, over }) =>
              over && over.id !== active.id
                ? `${nameOf(active.id)} is over ${nameOf(over.id)}.`
                : undefined,
            onDragEnd: ({ active, over }) =>
              over && over.id !== active.id
                ? `${nameOf(active.id)} swapped places with ${nameOf(over.id)}.`
                : `${nameOf(active.id)} dropped.`,
            onDragCancel: ({ active }) =>
              `Dragging ${nameOf(active.id)} was cancelled.`,
          },
        }}
      >
        <Poster
          state={state}
          species={species}
          AnimalShell={InteractiveShell}
          {...poster}
        />
        <DragOverlay dropAnimation={null}>
          {floating && sp && (
            <img
              src={artSrc(sp, state.style)}
              alt=""
              draggable={false}
              className="pointer-events-none object-contain drop-shadow-lg"
              style={{
                width: floating.width,
                height: floating.height,
                transform: floating.mirrored ? "scaleX(-1)" : undefined,
              }}
            />
          )}
        </DragOverlay>
      </DndContext>
    </ShellContext.Provider>
  );
}
