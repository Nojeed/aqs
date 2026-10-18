import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RecordDetail } from "@/components/admin/record-detail";
import { requireAdmin } from "@/lib/auth";
import { REGISTRATIONS_FILE, registrationStatuses, type Registration } from "@/lib/schema";
import { readJson } from "@/lib/storage";

export const metadata: Metadata = { title: "Registration" };

const link = (href: string, text: string) => (
  <a href={href} className="text-brand-700 hover:underline" dir="ltr">
    {text}
  </a>
);

export default async function RegistrationPage({ params }: PageProps<"/admin/registrations/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const r = (await readJson<Registration[]>(REGISTRATIONS_FILE)).find((x) => x.id === id);
  if (!r) notFound();

  return (
    <RecordDetail
      inbox="registrations"
      id={r.id}
      name={r.name}
      title={r.type === "company" ? `${r.company} · ${r.name}` : r.name}
      received={r.createdAt}
      status={r.status}
      statuses={registrationStatuses}
      history={r.history ?? []}
      facts={[
        ["Course", r.courseTitle],
        ["Registering as", r.type === "company" ? "Company" : "Individual"],
        ...(r.type === "company"
          ? ([
              ["Company", r.company],
              ["Trainees", r.trainees],
            ] as [string, React.ReactNode][])
          : []),
        ["Email", link(`mailto:${r.email}`, r.email)],
        ["Phone", link(`tel:${r.phone}`, r.phone)],
        ["Form language", r.locale === "ar" ? "Arabic" : "English"],
      ]}
    >
      {r.notes && (
        <>
          <h2 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Notes from the visitor</h2>
          <p className="mt-2 whitespace-pre-line text-slate-800" dir="auto">
            {r.notes}
          </p>
        </>
      )}
    </RecordDetail>
  );
}
