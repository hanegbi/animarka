import type { ReactNode } from "react";

export type OptionMeta = {
  id: string;
  name: string;
  rec?: boolean;
  source: { label: string; url: string };
  /** Two lines on how it looks and behaves. */
  how: string;
  strength: string;
  weakness: string;
};

/** One of the five options in a rule-of-five round: the sample, then the facts. */
export function OptionCard({
  meta,
  children,
}: {
  meta: OptionMeta;
  children: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-2" aria-labelledby={`oc-${meta.id}`}>
      <h4
        id={`oc-${meta.id}`}
        className="flex flex-wrap items-baseline gap-x-2 text-base font-semibold"
      >
        {meta.id}. {meta.name}
        {meta.rec && (
          <span className="rounded bg-green-900 px-1.5 py-0.5 text-xs font-normal text-white">
            Recommended
          </span>
        )}
      </h4>
      <div className="min-h-[230px]">{children}</div>
      <p className="text-sm text-neutral-800">{meta.how}</p>
      <p className="text-xs text-neutral-700">
        <b>Strength:</b> {meta.strength}
      </p>
      <p className="text-xs text-neutral-700">
        <b>Weakness:</b> {meta.weakness}
      </p>
      <a className="text-xs text-neutral-600 underline" href={meta.source.url}>
        Source: {meta.source.label}
      </a>
    </article>
  );
}

export function OptionRow({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3" aria-label={title}>
      <h3 className="text-xl font-semibold">{title}</h3>
      {intro && <p className="max-w-3xl text-sm text-neutral-700">{intro}</p>}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(270px,1fr))] gap-5">
        {children}
      </div>
    </section>
  );
}
