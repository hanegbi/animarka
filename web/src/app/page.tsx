import { PosterProvider } from "@/poster/state/provider";
import { Builder, BuilderFallback } from "./Builder";

export default function Home() {
  return (
    <PosterProvider fallback={<BuilderFallback />}>
      <Builder />
    </PosterProvider>
  );
}
