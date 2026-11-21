/** Ready sets of birds. The lists live in the API (api/data/presets.json). */
export type Preset = {
  id: string;
  title: string;
  description: string;
  ids: string[];
};
