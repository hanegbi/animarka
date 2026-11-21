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
import { Poster, type AnimalShellProps, type PosterProps } from "./Poster";

type Handlers = {
  onMirror: (id: string) => void;
  onSwap: (a: string, b: string) => void;
  onMove: (id: string, delta: 1 | -1) => void;
};

type Ctx = Handlers & {
  activeId: string | null;
  suppressClick: { current: boolean };
};
const ShellContext = createContext<Ctx | null>(null);

/**
 * One bird on the poster. Tap mirrors it. Drag it onto another bird to swap places.
 * Enter or Space mirrors, arrow keys move it through the order.
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
  const target = drop.isOver && ctx.activeId !== null && !dragging;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const action = keyToAction(e.key);
    if (!action) return;
    e.preventDefault();
    if (action.type === "mirror") ctx.onMirror(id);
    else ctx.onMove(id, action.delta);
  };

  return (
    <div
      ref={setRefs}
      {...drag.attributes}
      {...drag.listeners}
      role="button"
      aria-roledescription="draggable bird"
      aria-label={`${name}. Enter mirrors it. Arrow keys move it. Drag it onto another bird to swap.`}
      tabIndex={0}
      className="poster-animal focus-visible:ring-ring absolute cursor-grab rounded-[1cqw] outline-none focus-visible:ring-2 active:cursor-grabbing"
      style={{
        ...style,
        touchAction: "none",
        opacity: dragging ? 0.3 : 1,
        outline: target ? "0.6cqw solid var(--primary)" : undefined,
        outlineOffset: "0.4cqw",
      }}
      onClick={() => {
        if (ctx.suppressClick.current) return;
        ctx.onMirror(id);
      }}
      onKeyDown={onKeyDown}
      data-animal={id}
      data-mirrored={mirrored ? "true" : "false"}
      data-drop-target={target ? "true" : undefined}
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
  const { onMirror, onSwap, onMove, state, species, ...poster } = props;
  const [floating, setFloating] = useState<Floating>(null);
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

  const onDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    const shell = document.querySelector<HTMLElement>(
      `[data-animal="${CSS.escape(id)}"]`,
    );
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

  const onDragEnd = (e: DragEndEvent) => {
    setFloating(null);
    // The click that follows a drag must not mirror the bird.
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 60);
    if (e.over && e.over.id !== e.active.id)
      onSwap(String(e.active.id), String(e.over.id));
  };

  const ctx = useMemo<Ctx>(
    () => ({
      onMirror,
      onSwap,
      onMove,
      activeId: floating?.id ?? null,
      suppressClick,
    }),
    [onMirror, onSwap, onMove, floating],
  );

  const sp = floating ? species.get(floating.id) : undefined;

  return (
    <ShellContext.Provider value={ctx}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setFloating(null);
          suppressClick.current = false;
        }}
        accessibility={{
          screenReaderInstructions: {
            draggable:
              "Press Enter to mirror this bird. Press an arrow key to move it through the poster order.",
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
              src={artSrc(state.style, sp.artId ?? floating.id)}
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
