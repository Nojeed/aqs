import type { Registration } from "@/lib/schema";

const WEEKS = 12;
const DAY = 86_400_000;
const BAR = "#2f5fae"; // brand-500: validated on white (6.2:1, passes lightness and chroma checks)

/** Monday 00:00 UTC of the week containing `t`. */
function weekStart(t: number) {
  const d = new Date(t);
  const day = (d.getUTCDay() + 6) % 7;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day);
}

/** Counts for the last 12 weeks, oldest first. The admin dashboard renders per request, so "now" is current. */
function weeklyCounts(registrations: Registration[]) {
  const thisWeek = weekStart(Date.now());
  const weeks = Array.from({ length: WEEKS }, (_, i) => ({ start: thisWeek - (WEEKS - 1 - i) * 7 * DAY, count: 0, trainees: 0 }));
  for (const r of registrations) {
    const w = weeks.find((x) => x.start === weekStart(new Date(r.createdAt).getTime()));
    if (w) {
      w.count++;
      w.trainees += r.type === "company" ? (r.trainees ?? 1) : 1;
    }
  }
  return weeks;
}

const short = (t: number) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Registrations per week (last 12 weeks) and per course. Single series each, so no legend: the title names it. */
export function RegistrationCharts({ registrations }: { registrations: Registration[] }) {
  if (registrations.length === 0) {
    return <p className="text-sm text-slate-500">Charts appear here once the first registrations come in.</p>;
  }

  const weeks = weeklyCounts(registrations);
  const max = Math.max(1, ...weeks.map((w) => w.count));
  const peak = weeks.reduce((a, b) => (b.count > a.count ? b : a));

  // Per course: top 6, the rest folded into "Other"
  const byCourse = new Map<string, number>();
  for (const r of registrations) byCourse.set(r.courseTitle, (byCourse.get(r.courseTitle) ?? 0) + 1);
  const sorted = [...byCourse].sort((a, b) => b[1] - a[1]);
  const courses = sorted.length > 7 ? [...sorted.slice(0, 6), ["Other", sorted.slice(6).reduce((n, [, c]) => n + c, 0)] as [string, number]] : sorted;

  // Column chart geometry (viewBox units)
  const W = 600;
  const H = 180;
  const top = 18;
  const bottom = 24;
  const plot = H - top - bottom;
  const slot = W / WEEKS;
  const bar = Math.min(28, slot * 0.6);
  const gridSteps = max >= 4 ? [0.5, 1] : [1];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <figure className="rounded-2xl border border-slate-200 bg-white p-5">
        <figcaption className="font-display font-bold text-brand-950">Registrations per week</figcaption>
        <p className="text-xs text-slate-500">Last {WEEKS} weeks · hover a column for details</p>
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label={`Registrations per week for the last ${WEEKS} weeks; peak ${peak.count} in the week of ${short(peak.start)}`}>
          {gridSteps.map((g) => (
            <g key={g}>
              <line x1={0} x2={W} y1={top + plot * (1 - g)} y2={top + plot * (1 - g)} stroke="#e2e8f0" strokeDasharray="3 4" />
              <text x={0} y={top + plot * (1 - g) - 4} fontSize={10} fill="#94a3b8">
                {Math.round(max * g)}
              </text>
            </g>
          ))}
          <line x1={0} x2={W} y1={top + plot} y2={top + plot} stroke="#cbd5e1" />
          {weeks.map((w, i) => {
            const h = (w.count / max) * plot;
            const x = i * slot + (slot - bar) / 2;
            const y = top + plot - h;
            const r = Math.min(4, h / 2);
            return (
              <g key={w.start} className="group">
                {/* Hit target covers the whole column slot, bigger than the mark */}
                <rect x={i * slot} y={top} width={slot} height={plot} fill="transparent">
                  <title>{`Week of ${short(w.start)}: ${w.count} registration${w.count === 1 ? "" : "s"}, ${w.trainees} trainee${w.trainees === 1 ? "" : "s"}`}</title>
                </rect>
                {w.count > 0 && (
                  <path
                    d={`M${x},${top + plot} V${y + r} Q${x},${y} ${x + r},${y} H${x + bar - r} Q${x + bar},${y} ${x + bar},${y + r} V${top + plot} Z`}
                    fill={BAR}
                    className="pointer-events-none transition-opacity group-hover:opacity-80"
                  />
                )}
                {w === peak && w.count > 0 && (
                  <text x={x + bar / 2} y={y - 5} fontSize={11} fontWeight={600} textAnchor="middle" fill="#0f172a">
                    {w.count}
                  </text>
                )}
                {i % 2 === WEEKS % 2 && (
                  <text x={i * slot + slot / 2} y={H - 6} fontSize={10} textAnchor="middle" fill="#64748b">
                    {short(w.start)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer font-semibold text-brand-700 hover:underline">Show as table</summary>
          <table className="mt-2 w-full text-start tabular-nums">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="py-1 text-start font-semibold">Week of</th>
                <th className="py-1 text-end font-semibold">Registrations</th>
                <th className="py-1 text-end font-semibold">Trainees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {weeks.map((w) => (
                <tr key={w.start}>
                  <td className="py-1">{short(w.start)}</td>
                  <td className="py-1 text-end">{w.count}</td>
                  <td className="py-1 text-end">{w.trainees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </figure>

      <BarList title="Registrations per course" subtitle="All time" items={courses.map(([label, value]) => ({ label, value }))} />
    </div>
  );
}

/** Horizontal bars for a ranked list (one series, so no legend). Labels and values use text colours, never the bar colour. */
export function BarList({
  title,
  subtitle,
  items,
  empty = "Nothing to show yet.",
}: {
  title: string;
  subtitle?: string;
  items: { label: string; value: number; href?: string }[];
  empty?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <figure className="rounded-2xl border border-slate-200 bg-white p-5">
      <figcaption className="font-display font-bold text-brand-950">{title}</figcaption>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.label} title={`${item.label}: ${item.value}`} className="group">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                {item.href ? (
                  <a href={item.href} className="truncate text-slate-700 hover:text-brand-700 hover:underline">
                    {item.label}
                  </a>
                ) : (
                  <span className="truncate text-slate-700">{item.label}</span>
                )}
                <span className="font-semibold text-slate-900 tabular-nums">{item.value}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full transition-opacity group-hover:opacity-80"
                  style={{ width: `${Math.max(2, (item.value / max) * 100)}%`, background: BAR }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}
