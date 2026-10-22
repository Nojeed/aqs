import type { Metadata } from "next";
import { ActivityTable } from "@/components/admin/activity-table";
import { readAudit } from "@/lib/audit";
import { requireOwner } from "@/lib/auth";

export const metadata: Metadata = { title: "Activity" };

export default async function ActivityPage() {
  await requireOwner();
  const rows = (await readAudit()).map((e, i) => ({ id: String(i), ...e }));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-bold">Activity</h1>
      <p className="mt-1 text-slate-500">Who signed in and what they changed (the last 2,000 actions).</p>
      <div className="mt-8">
        <ActivityTable rows={rows} />
      </div>
    </div>
  );
}
