import { notFound } from "next/navigation";

/** Design sample pages exist only in development, unless NEXT_PUBLIC_SHOW_DESIGN=1. */
export default function DesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_SHOW_DESIGN !== "1"
  ) {
    notFound();
  }
  return children;
}
