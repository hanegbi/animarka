/* eslint-disable @next/next/no-img-element */
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { backgroundOf } from "@/catalog/backgrounds";
import { artSrc, displayName, type SpeciesView } from "@/catalog/species-view";
import { layoutForState } from "@/poster/layout/for-state";
import { frameAspect } from "@/poster/layout/sizing";
import { unionBox } from "@/poster/layout/clamp";
import type { Box, LayoutResult } from "@/poster/layout/types";
import { effectiveMirror } from "@/poster/state/mirror";
import { EditableName } from "./EditableName";
import type { CatalogLookup, PosterState } from "@/poster/state/types";

/** Everything is positioned in `cqw`: layout units are percent of the poster width. */
const cqw = (v: number) => `${v}cqw`;

function boxStyle(b: Box, origin?: Box): CSSProperties {
  return {
    left: cqw(b.x - (origin?.x ?? 0)),
    top: cqw(b.y - (origin?.y ?? 0)),
    width: cqw(b.w),
    height: cqw(b.h),
  };
}

export type AnimalShellProps = {
  id: string;
  name: string;
  mirrored: boolean;
  style: CSSProperties;
  children: ReactNode;
};

/** The default shell is a plain box. The interactive poster swaps in one that can be dragged and focused. */
function PlainShell({ id, mirrored, style, children }: AnimalShellProps) {
  return (
    <div
      className="poster-animal absolute"
      style={style}
      data-animal={id}
      data-mirrored={mirrored ? "true" : "false"}
    >
      {children}
    </div>
  );
}

export type PosterProps = {
  state: PosterState;
  species: Map<string, SpeciesView>;
  catalog: CatalogLookup;
  /** Skip layout and use this result, for example in tests. */
  layout?: LayoutResult;
  /** Full size images and no motion, for the print render. */
  print?: boolean;
  className?: string;
  /** Called with the new title when the user types. Without it the title is plain text. */
  onTitleChange?: (title: string) => void;
  /** Replaces the box around each animal. Used to make animals draggable. */
  AnimalShell?: ComponentType<AnimalShellProps>;
  /** Drawn on top of the poster, for example the empty state. */
  overlay?: ReactNode;
  /** Called when the user renames a bird by clicking its name. Without it names are plain text. */
  onNameChange?: (id: string, name: string) => void;
};

export function Poster({
  state,
  species,
  catalog,
  layout,
  print,
  className = "",
  onTitleChange,
  AnimalShell = PlainShell,
  overlay,
  onNameChange,
}: PosterProps) {
  const result = layout ?? layoutForState(state, species);
  const { frame, items } = result;
  const bg = backgroundOf(state.bg);
  const rtl = state.lang === "he";
  const aspect = frameAspect(state.size, state.orientation);

  const style: CSSProperties = {
    aspectRatio: String(aspect),
    containerType: "inline-size",
    backgroundColor: bg.color,
    backgroundImage:
      bg.kind === "image"
        ? `url(${print ? bg.imageFull : bg.image})`
        : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: bg.ink,
    ["--rule" as string]: bg.rule,
  };

  const titleStyle: CSSProperties = {
    ...boxStyle(frame.title),
    fontSize: cqw(frame.title.h * 0.68),
  };

  return (
    <div
      className={`poster relative w-full overflow-hidden ${className}`}
      style={style}
      dir={rtl ? "rtl" : "ltr"}
      lang={state.lang}
      data-poster
      data-dark={bg.isDark ? "true" : "false"}
    >
      {onTitleChange ? (
        <input
          className="poster-title font-heading absolute m-0 border-0 bg-transparent p-0 text-center leading-none font-semibold outline-none focus-visible:ring-2"
          style={titleStyle}
          value={state.title}
          maxLength={32}
          aria-label="Poster title"
          onChange={(e) => onTitleChange(e.target.value)}
          data-poster-title
        />
      ) : (
        <h2
          className="poster-title font-heading absolute m-0 flex items-center justify-center text-center leading-none font-semibold"
          style={titleStyle}
          data-poster-title
        >
          {state.title}
        </h2>
      )}

      {items.map((item) => {
        const sp = species.get(item.id)!;
        const name = state.names?.[item.id] ?? displayName(sp, state.lang);
        const block = unionBox(item.art, item.label, item.number);
        const mirrored = effectiveMirror(state, item.id, catalog);
        return (
          <AnimalShell
            key={item.id}
            id={item.id}
            name={name}
            mirrored={mirrored}
            style={{
              ...boxStyle(block),
              transition: print ? "none" : undefined,
            }}
          >
            <div
              className="poster-art absolute"
              style={boxStyle(item.art, block)}
              data-art
            >
              <img
                src={artSrc(sp, state.style)}
                alt={name}
                draggable={false}
                className="poster-img size-full object-contain"
                style={{ transform: mirrored ? "scaleX(-1)" : undefined }}
              />
            </div>
            {item.label && (
              <p
                className="poster-label absolute m-0 text-center"
                style={{
                  ...boxStyle(item.label, block),
                  fontSize: cqw(item.font),
                  lineHeight: 1.15,
                }}
                data-label
              >
                {onNameChange ? (
                  <EditableName
                    name={name}
                    original={displayName(sp, state.lang)}
                    onChange={(n) => onNameChange(item.id, n)}
                  />
                ) : (
                  <span className="poster-label-text">{name}</span>
                )}
              </p>
            )}
            {item.number && (
              <p
                className="poster-number absolute m-0 text-center font-semibold"
                style={{
                  ...boxStyle(item.number, block),
                  fontSize: cqw(item.font),
                  lineHeight: 1.5,
                }}
                data-number
              >
                {item.index + 1}
              </p>
            )}
          </AnimalShell>
        );
      })}

      {frame.legend && (
        <ol
          className="poster-legend absolute m-0 grid list-none p-0"
          style={{
            ...boxStyle(frame.legend.box),
            gridTemplateColumns: `repeat(${frame.legend.cols}, 1fr)`,
            gridAutoRows: cqw(frame.legend.rowHeight),
            fontSize: cqw(frame.legend.font),
            lineHeight: 1.4,
            paddingBlockStart: cqw(frame.legend.font * 0.3),
            columnGap: cqw(frame.legend.font),
            gridAutoFlow: "row",
          }}
          data-legend
        >
          {items.map((item) => (
            <li key={item.id} className="truncate">
              <b className="me-[0.4em]">{item.index + 1}</b>
              {onNameChange ? (
                <EditableName
                  original={displayName(species.get(item.id)!, state.lang)}
                  name={
                    state.names?.[item.id] ??
                    displayName(species.get(item.id)!, state.lang)
                  }
                  onChange={(n) => onNameChange(item.id, n)}
                />
              ) : (
                (state.names?.[item.id] ??
                displayName(species.get(item.id)!, state.lang))
              )}
            </li>
          ))}
        </ol>
      )}
      {overlay}
    </div>
  );
}
