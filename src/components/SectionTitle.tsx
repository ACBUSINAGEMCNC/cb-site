type SectionTitleProps = {
  kicker: string;
  title: string;
  description?: string;
};

export default function SectionTitle({
  kicker,
  title,
  description,
}: SectionTitleProps) {
  return (
    <div className="max-w-3xl">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
        {kicker}
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold uppercase leading-[0.95] tracking-[-0.035em] text-fg sm:text-4xl">
        {title}
      </h2>
      <div className="hazard-stripe mt-4 w-16" aria-hidden="true" />
      {description ? (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
