import { Suspense } from "react";
import { BuilderFallback } from "../../Builder";
import { SharedPoster } from "./SharedPoster";

async function Shared({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SharedPoster id={id} />;
}

export default function SharedPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<BuilderFallback />}>
      <Shared {...props} />
    </Suspense>
  );
}
