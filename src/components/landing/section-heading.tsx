interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark mb-3">
        {eyebrow}
      </p>
      <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3">
        {title}
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
