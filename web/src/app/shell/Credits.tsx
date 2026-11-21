/** Art credits. Both sets are required by their licenses and both are AI generated. */
export function Credits({ className = "" }: { className?: string }) {
  return (
    <footer
      className={`text-muted-foreground text-[11px] leading-snug ${className}`}
    >
      <p>
        Field guide art by Huashu, from{" "}
        <a
          className="underline"
          href="https://github.com/alchaincyf/huashu-bird-sticker"
        >
          huashu-bird-sticker
        </a>
        , CC BY 4.0. Woodblock art by Adam Oberley, Teddy Warner and
        contributors, from{" "}
        <a
          className="underline"
          href="https://github.com/adamoberley/HABirdDashboard"
        >
          HABirdDashboard
        </a>
        , MIT. Both sets are AI generated and may contain errors.
      </p>
    </footer>
  );
}
