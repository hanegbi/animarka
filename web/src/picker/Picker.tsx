"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { PRESETS } from "@/catalog/presets";
import {
  useCatalog,
  usePosterActions,
  usePosterState,
} from "@/poster/state/provider";
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

/** The bird picker: search, family chips, the card list, list actions, presets and the tray. */
export function Picker() {
  const state = usePosterState();
  const { dispatch } = usePosterActions();
  const { species, list } = useCatalog();
  const [view, setView] = useState(ALL);
  const [query, setQuery] = useState("");

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

  const changeView = (next: string) => {
    setView(next);
    setQuery("");
  };

  return (
    <div className="flex min-h-full flex-col gap-3">
      <SearchField
        value={query}
        onChange={setQuery}
        status={statusLine(shown, view, query, state.order)}
      />
      <FamilyChips
        families={families}
        view={view}
        onView={changeView}
        totalOnPoster={state.order.length}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="lg"
          disabled={actions.addAllDisabled}
          onClick={() =>
            dispatch(
              actions.allOn
                ? { type: "removeMany", ids }
                : { type: "addMany", ids },
            )
          }
        >
          {actions.addAllLabel}
        </Button>
        {!actions.onlyHidden && (
          <Button
            variant="outline"
            size="lg"
            disabled={actions.onlyDisabled}
            title="Replace the poster with just these birds"
            onClick={() => dispatch({ type: "replaceWith", ids })}
          >
            {actions.onlyLabel}
          </Button>
        )}
      </div>

      <BirdGrid
        items={shown}
        selected={selected}
        onToggle={(id) => dispatch({ type: "toggle", id })}
        style={state.style}
        lang={state.lang}
      />

      <section
        aria-labelledby="tray-title"
        className="flex flex-col gap-2 border-t pt-3"
      >
        <h2 id="tray-title" className="font-sans text-sm font-semibold">
          Your poster{" "}
          <span className="text-muted-foreground font-normal">
            ({trayLabel(state.order, species)})
          </span>
        </h2>
        <Tray
          order={state.order}
          species={species}
          style={state.style}
          lang={state.lang}
          onRemove={(id) => dispatch({ type: "toggle", id })}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              dispatch({
                type: "surprise",
                seed: Math.floor(Math.random() * 1e6),
              })
            }
          >
            Surprise mix
          </Button>
          <Button
            variant="outline"
            size="lg"
            disabled={!state.order.length}
            onClick={() => dispatch({ type: "clear" })}
          >
            Clear poster
          </Button>
        </div>
        <div
          role="group"
          aria-label="Start from a preset"
          className="flex flex-wrap items-center gap-1.5"
        >
          <span className="text-muted-foreground text-xs">Presets</span>
          {PRESETS.map((p) => (
            <Button
              key={p.id}
              variant="ghost"
              size="sm"
              title={p.description}
              onClick={() => dispatch({ type: "replaceWith", ids: p.ids })}
            >
              {p.title}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
