import type { ReactNode } from "react";

export function SectionHeading({
  kicker,
  title,
  lede,
  as: Heading = "h2",
}: {
  kicker?: string;
  title: ReactNode;
  lede?: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="section-heading">
      {kicker ? <p className="kicker">{kicker}</p> : null}
      <Heading className="section-title">{title}</Heading>
      {lede ? <p className="section-lede">{lede}</p> : null}
    </div>
  );
}
