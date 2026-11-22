"use client";

import type { ComponentType } from "react";
import * as B from "@/design/landing/bottom";
import * as M from "@/design/landing/middle";
import * as T from "@/design/landing/top";

/** Round R7, the landing page: five real options for each of ten parts, at 1280 px. Dev only. */
const ROUNDS: { title: string; options: [string, ComponentType][] }[] = [
  {
    title: "Top bar",
    options: [
      ["N1", T.N1],
      ["N2", T.N2],
      ["N3", T.N3],
      ["N4", T.N4],
      ["N5", T.N5],
    ],
  },
  {
    title: "Hero",
    options: [
      ["H1", T.H1],
      ["H2", T.H2],
      ["H3", T.H3],
      ["H4", T.H4],
      ["H5", T.H5],
    ],
  },
  {
    title: "How it works",
    options: [
      ["W1", M.W1],
      ["W2", M.W2],
      ["W3", M.W3],
      ["W4", M.W4],
      ["W5", M.W5],
    ],
  },
  {
    title: "Two styles",
    options: [
      ["S1", M.S1],
      ["S2", M.S2],
      ["S3", M.S3],
      ["S4", M.S4],
      ["S5", M.S5],
    ],
  },
  {
    title: "Ready sets",
    options: [
      ["G1", M.G1],
      ["G2", M.G2],
      ["G3", M.G3],
      ["G4", M.G4],
      ["G5", M.G5],
    ],
  },
  {
    title: "Make it yours",
    options: [
      ["F1", B.F1],
      ["F2", B.F2],
      ["F3", B.F3],
      ["F4", B.F4],
      ["F5", B.F5],
    ],
  },
  {
    title: "Print and share",
    options: [
      ["P1", B.P1],
      ["P2", B.P2],
      ["P3", B.P3],
      ["P4", B.P4],
      ["P5", B.P5],
    ],
  },
  {
    title: "FAQ",
    options: [
      ["Q1", B.Q1],
      ["Q2", B.Q2],
      ["Q3", B.Q3],
      ["Q4", B.Q4],
      ["Q5", B.Q5],
    ],
  },
  {
    title: "Final call",
    options: [
      ["C1", B.C1],
      ["C2", B.C2],
      ["C3", B.C3],
      ["C4", B.C4],
      ["C5", B.C5],
    ],
  },
  {
    title: "Footer",
    options: [
      ["Z1", B.Z1],
      ["Z2", B.Z2],
      ["Z3", B.Z3],
      ["Z4", B.Z4],
      ["Z5", B.Z5],
    ],
  },
];

export default function LandingRound() {
  return (
    <main className="bg-muted flex flex-col gap-16 py-10">
      {ROUNDS.map((r) => (
        <section key={r.title} className="flex flex-col gap-6">
          <h2 className="font-heading px-10 text-2xl font-semibold">
            {r.title}
          </h2>
          {r.options.map(([code, C]) => (
            <div key={code} className="mx-auto flex w-[1280px] flex-col gap-2">
              <p className="font-mono text-sm font-semibold">{code}</p>
              <div
                id={code}
                data-option
                className="bg-background overflow-hidden rounded-[6px] border"
              >
                <C />
              </div>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
