import { toast } from "sonner";

/** A message with an Undo button, for anything that changes the poster a lot. Gone after 5 seconds. */
export function notifyUndoable(message: string, undo: () => void): void {
  toast(message, { action: { label: "Undo", onClick: undo } });
}

/** A plain message, for example Link copied. */
export function notify(message: string): void {
  toast(message);
}
