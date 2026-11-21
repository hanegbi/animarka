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
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { artSrc, displayName } from "@/catalog/species-view";
import { keyToAction } from "@/poster/interactions";
import { BirdActionBar } from "./BirdActionBar";
import { Poster, type AnimalShellProps, type PosterProps } from "./Poster";

type Handlers = {
  onMirror: (id: string) => void;
  onRemove: (id: string) => void;
  onSwap: (a: string, b: string) => void;
  onMove: (id: string, delta: 1 | -1) => void;
};

type Ctx = Handlers & {
  activeId: string | null;
  selectedId: string | null;
  /** Select a bird, or deselect it if it already is. `keyboard` moves focus into the buttons. */
  toggleSelect: (id: string, keyboard: boolean) => void;
  suppressClick: { current: boolean };
};
const ShellContext = createContext<Ctx | null>(null);

/**
 * One bird on the poster. Tap it to select it: a bar with Mirror and Remove buttons appears.
 * Drag it onto another bird to swap places. Enter or Space selects, Delete removes, arrow keys move it.
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
  const selected = ctx.selectedId === id;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const action = keyToAction(e.key);
    if (!action) return;
    e.preventDefault();
    if (action.type === "select") ctx.toggleSelect(id, true);
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
      aria-expanded={selected}
      aria-label={`${name}. Enter shows the Mirror and Remove buttons. Arrow keys move it. Delete removes it. Drag it onto another bird to swap.`}
      tabIndex={0}
      className="poster-animal focus-visible:ring-ring absolute cursor-grab rounded-[1cqw] outline-none focus-visible:ring-2 active:cursor-grabbing"
      style={{
        ...style,
        touchAction: "none",
        opacity: dragging ? 0.3 : 1,
        outline: target
          ? "0.6cqw solid var(--primary)"
          : selected
            ? "0.35cqw solid var(--primary)"
            : undefined,
        outlineOffset: "0.4cqw",
      }}
      onClick={() => {
        if (ctx.suppressClick.current) return;
        ctx.toggleSelect(id, false);
      }}
      onKeyDown={onKeyDown}
      data-animal={id}
      data-mirrored={mirrored ? "true" : "false"}
      data-selected={selected ? "true" : undefined}
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
  const { onMirror, onRemove, onSwap, onMove, state, species, ...poster } =
    props;
  const [floating, setFloating] = useState<Floating>(null);
  const [selection, setSelection] = useState<{
    id: string;
    keyboard: boolean;
  } | null>(null);
  const suppressClick = useRef(false);

  // A selection only counts while that bird is still on the poster.
  const selectedId =
    selection && state.order.includes(selection.id) ? selection.id : null;

  // A small movement threshold keeps a plain tap a tap, so tap can select and drag can swap.
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

  const toggleSelect = useCallback((id: string, keyboard: boolean) => {
    setSelection((cur) => (cur?.id === id ? null : { id, keyboard }));
  }, []);

  const closeSelection = useCallback(
    (refocusBird: boolean) => {
      const id = selectedId;
      setSelection(null);
      if (refocusBird && id) {
        requestAnimationFrame(() =>
          document
            .querySelector<HTMLElement>(`[data-animal="${CSS.escape(id)}"]`)
            ?.focus(),
        );
      }
    },
    [selectedId],
  );

  // Tap anywhere that is not a bird or the buttons, or press Escape, to put the buttons away.
  useEffect(() => {
    if (!selectedId) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t?.closest("[data-bird-bar], [data-animal]")) return;
      setSelection(null);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") closeSelection(true);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [selectedId, closeSelection]);

  const onDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    const shell = document.querySelector<HTMLElement>(
      `[data-animal="${CSS.escape(id)}"]`,
    );
    const art = shell
      ?.querySelector<HTMLElement>("[data-art]")
      ?.getBoundingClientRect();
    suppressClick.current = true;
    setSelection(null);
    setFloating({
      id,
      width: art?.width ?? 80,
      height: art?.height ?? 100,
      mirrored: shell?.getAttribute("data-mirrored") === "true",
    });
  };

  const onDragEnd = (e: DragEndEvent) => {
    setFloating(null);
    // The click that follows a drag must not select the bird.
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 60);
    if (e.over && e.over.id !== e.active.id)
      onSwap(String(e.active.id), String(e.over.id));
  };

  const removeSelected = useCallback(
    (id: string) => {
      setSelection(null);
      onRemove(id);
    },
    [onRemove],
  );

  const ctx = useMemo<Ctx>(
    () => ({
      onMirror,
      onRemove: removeSelected,
      onSwap,
      onMove,
      activeId: floating?.id ?? null,
      selectedId,
      toggleSelect,
      suppressClick,
    }),
    [
      onMirror,
      removeSelected,
      onSwap,
      onMove,
      floating,
      selectedId,
      toggleSelect,
    ],
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
              "Press Enter to show the Mirror and Remove buttons. Press an arrow key to move this bird through the poster order. Press Delete to remove it.",
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
      {selectedId && !floating && (
        <BirdActionBar
          id={selectedId}
          name={nameOf(selectedId)}
          focusFirst={selection?.keyboard ?? false}
          onMirror={() => onMirror(selectedId)}
          onRemove={() => removeSelected(selectedId)}
          onClose={closeSelection}
        />
      )}
    </ShellContext.Provider>
  );
}
