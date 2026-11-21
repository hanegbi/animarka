/**
 * Messages. The toast library (Sonner, about 10 KB gzipped) is not loaded with the page. The first message
 * loads it, mounts the toaster, then shows. Later messages show at once.
 */

type Listener = () => void;

let armed = false;
const listeners = new Set<Listener>();
let markReady!: () => void;
const ready = new Promise<void>((resolve) => {
  markReady = resolve;
});

export const subscribeToaster = (listener: Listener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export const toasterArmed = () => armed;

/** Called by the toaster once it is on the page and listening. */
export function toasterMounted(): void {
  markReady();
}

async function show(
  fn: (toast: typeof import("sonner").toast) => void,
): Promise<void> {
  if (!armed) {
    armed = true;
    listeners.forEach((l) => l());
  }
  const [{ toast }] = await Promise.all([import("sonner"), ready]);
  fn(toast);
}

/** A message with an Undo button, for anything that changes the poster a lot. Gone after 5 seconds. */
export function notifyUndoable(message: string, undo: () => void): void {
  void show((toast) =>
    toast(message, { action: { label: "Undo", onClick: undo } }),
  );
}

/** A plain message, for example Link copied. */
export function notify(message: string): void {
  void show((toast) => toast(message));
}
