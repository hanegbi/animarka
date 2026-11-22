import { buttonVariants } from "@/components/ui/button";

/**
 * A small header link to the credits page. The credit line itself never shows in the builder
 * (owner's call); the page keeps the attribution CC BY 4.0 and MIT ask for.
 */
export function Credits() {
  return (
    <a
      href="/credits"
      className={buttonVariants({ variant: "ghost", size: "sm" })}
    >
      Credits
    </a>
  );
}
