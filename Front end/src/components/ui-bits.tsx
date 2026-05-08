import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  description,
  icon,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  icon?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-hero border-b border-border/40">
      <div className="absolute inset-0 bg-grid" aria-hidden />
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 relative">
        <div className="flex flex-col items-start gap-5 max-w-3xl">
          <div className="flex items-center gap-2.5">
            {icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                {icon}
              </div>
            )}
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.15] md:text-6xl">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl max-w-2xl leading-relaxed">{description}</p>
        </div>
      </div>
    </section>
  );
}

export function FeatureCard({
  icon,
  title,
  description,
  badge,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="card-elevated p-6 group">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-cyan/10 text-primary">
          {icon}
        </div>
        {badge && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-cyan border border-cyan/30 rounded-full px-2 py-0.5">
            {badge}
          </span>
        )}
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

export function ScreenCard({
  number,
  title,
  description,
  features,
  backend,
}: {
  number: string;
  title: string;
  description: string;
  features: string[];
  backend: string;
}) {
  return (
    <div className="card-elevated p-7">
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-primary">{number}</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      <div className="mt-5">
        <h4 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Key features
        </h4>
        <ul className="mt-2 space-y-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-primary" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 rounded-xl border border-cyan/20 bg-cyan/5 p-3">
        <h4 className="font-mono text-[10px] uppercase tracking-wider text-cyan">Backend</h4>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{backend}</p>
      </div>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-12 max-w-2xl">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{eyebrow}</span>
      <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base text-muted-foreground">{description}</p>}
    </div>
  );
}
