import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {subtitle ? (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed opacity-60 sm:text-base">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number | string;
  href?: string;
  hint?: string;
};

export function StatCard({ label, value, href, hint }: StatCardProps) {
  const body = (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-5 transition hover:border-primary/40 hover:shadow-sm">
      <p className="text-sm font-medium opacity-55">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      {hint ? <p className="mt-2 text-xs opacity-45">{hint}</p> : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {body}
      </Link>
    );
  }

  return body;
}

export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-base-300 bg-base-100 p-5 sm:p-6 ${className}`}
    >
      {title ? <h2 className="mb-4 text-lg font-semibold">{title}</h2> : null}
      {children}
    </section>
  );
}

export function ComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Panel>
        <p className="text-sm opacity-60">
          Cette section sera disponible bientôt.
        </p>
      </Panel>
    </div>
  );
}
