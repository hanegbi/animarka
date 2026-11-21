"use client";

import { ChevronDownIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { notify, notifyUndoable } from "@/lib/notify";
import {
  useCatalog,
  usePosterActions,
  usePosterState,
} from "@/poster/state/provider";
import { MAX_BIRDS, type PosterAction } from "@/poster/state/types";
import { BirdGrid } from "./BirdGrid";
import { FamilyChips } from "./FamilyChips";
import {
  ALL,
  familyList,
  listActions,
  shownList,
  statusLine,
  trayLabel,
} from "./filter";
import { SearchField } from "./SearchField";
import { Tray } from "./Tray";

const SUGGESTIONS = ["kestrel", "heron", "owl", "swan"];

/** E1 pattern for a search with no result: what was typed, and words to try. */
function SearchMiss({
  query,
  onTry,
}: {
  query: string;
  onTry: (word: string) => void;
}) {
  return (
    <div
      className="flex min-h-[300px] flex-1 flex-col items-start gap-2 rounded-lg border border-dashed p-4"
      data-search-miss
    >
      <p className="font-heading text-base font-semibold">
        No bird matches &ldquo;{query}&rdquo;
      </p>
      <p className="text-muted-foreground text-sm">
        Try a name, a family or a Latin name.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((w) => (
          <Button
            key={w}
            variant="outline"
            size="default"
            className="rounded-full"
            onClick={() => onTry(w)}
          >
            {w}
          </Button>
        ))}
      </div>
    </div>
  );
}

/** The bird picker: search, sets, the birds on your poster, family chips, list actions and the card list. */
export function Picker() {
  const state = usePosterState();
  const { dispatch, undo } = usePosterActions();
  const { species, list, presets } = useCatalog();
  const [view, setView] = useState(ALL);
  const [query, setQuery] = useState("");
  const [setsOpen, setSetsOpen] = useState(false);

  const shown = useMemo(
    () => shownList(list, view, query),
    [list, view, query],
  );
  const selected = useMemo(() => new Set(state.order), [state.order]);
  const families = useMemo(
    () => familyList(list, state.order),
    [list, state.order],
  );
  const actions = listActions(shown, view, query, state.order);
  const ids = shown.map((s) => s.id);

  /** Run an action. If it changed the poster a lot, say so with an Undo button. */
  const act = (action: PosterAction, message?: string) => {
    const changed = dispatch(action);
    if (changed && message) notifyUndoable(message, undo);
  };

  /** Tap a card: add or remove the bird. A full poster says why nothing happened. */
  const toggle = (id: string) => {
    if (!selected.has(id) && state.order.length >= MAX_BIRDS) {
      notify(
        `A poster holds up to ${MAX_BIRDS} birds. Remove one to add another.`,
      );
      return;
    }
    dispatch({ type: "toggle", id });
  };

  const changeView = useCallback((next: string) => {
    setView(next);
    setQuery("");
  }, []);

  return (
    <div className="flex min-h-full flex-col gap-4">
      <SearchField
        value={query}
        onChange={setQuery}
        status={statusLine(shown, view, query, state.order)}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          aria-expanded={setsOpen}
          aria-controls="preset-list"
          onClick={() => setSetsOpen((o) => !o)}
        >
          Start from a set
          <ChevronDownIcon
            className={`transition-transform ${setsOpen ? "rotate-180" : ""}`}
          />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            act(
              { type: "surprise", seed: Math.floor(Math.random() * 1e6) },
              "New surprise mix",
            )
          }
        >
          Surprise mix
        </Button>
      </div>
      {setsOpen && (
        <div
          id="preset-list"
          role="group"
          aria-label="Start from a preset"
          className="grid grid-cols-2 gap-1.5"
        >
          {presets.map((p) => (
            <Button
              key={p.id}
              variant="secondary"
              size="sm"
              className="justify-start truncate"
              title={p.description}
              onClick={() => {
                act({ type: "replaceWith", ids: p.ids }, `${p.title} added`);
                setSetsOpen(false);
              }}
            >
              {p.title}
            </Button>
          ))}
        </div>
      )}

      <section aria-labelledby="tray-title" className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2
            id="tray-title"
            className="text-muted-foreground font-sans text-[11px] font-semibold tracking-wide uppercase"
          >
            Your poster{" "}
            <span className="tracking-normal normal-case">
              · {trayLabel(state.order, species)}
            </span>
          </h2>
          <Button
            variant="ghost"
            size="sm"
            disabled={!state.order.length}
            onClick={() => act({ type: "clear" }, "Poster cleared")}
          >
            Clear poster
          </Button>
        </div>
        <Tray
          order={state.order}
          species={species}
          style={state.style}
          lang={state.lang}
          onRemove={(id, name) =>
            act({ type: "toggle", id }, `${name} removed`)
          }
        />
      </section>

      <FamilyChips
        families={families}
        view={view}
        onView={changeView}
        totalOnPoster={state.order.length}
      />

      {(!actions.addAllHidden || !actions.onlyHidden) && (
        <div className="flex flex-wrap gap-2">
          {!actions.addAllHidden && (
            <Button
              variant="outline"
              size="sm"
              disabled={actions.addAllDisabled}
              onClick={() =>
                actions.allOn
                  ? act(
                      { type: "removeMany", ids },
                      `Removed ${ids.length} ${ids.length === 1 ? "bird" : "birds"}`,
                    )
                  : dispatch({ type: "addMany", ids })
              }
            >
              {actions.addAllLabel}
            </Button>
          )}
          {!actions.onlyHidden && (
            <Button
              variant="outline"
              size="sm"
              disabled={actions.onlyDisabled}
              title="Replace the poster with just these birds"
              onClick={() =>
                act({ type: "replaceWith", ids }, "Poster replaced")
              }
            >
              {actions.onlyLabel}
            </Button>
          )}
        </div>
      )}

      {shown.length === 0 ? (
        <SearchMiss query={query} onTry={setQuery} />
      ) : (
        <BirdGrid
          items={shown}
          selected={selected}
          onToggle={toggle}
          style={state.style}
          lang={state.lang}
        />
      )}
    </div>
  );
}
