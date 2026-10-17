/** Shown for a moment while a newly added page renders for the first time. */
export function DetailSkeleton() {
  return (
    <div aria-hidden>
      <div className="bg-brand-900 pt-36 pb-20">
        <div className="container-page space-y-5">
          <div className="h-4 w-40 animate-pulse rounded-full bg-white/15" />
          <div className="h-12 w-full max-w-2xl animate-pulse rounded-2xl bg-white/15" />
          <div className="h-5 w-full max-w-xl animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4">
          <div className="aspect-[16/9] animate-pulse rounded-3xl bg-slate-100" />
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-4 animate-pulse rounded-full bg-slate-100" />
          ))}
        </div>
        <div className="h-72 animate-pulse rounded-3xl bg-slate-100" />
      </div>
    </div>
  );
}
