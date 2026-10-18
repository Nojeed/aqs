import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteCertificate, saveCertificate } from "@/app/admin/actions";
import { ContentEditor } from "@/components/admin/editor/content-editor";
import { requireAdmin } from "@/lib/auth";
import { nextCertificateId, readCertificates } from "@/lib/certificates";
import { readCollection } from "@/lib/content";
import { certificateFields, emptyObject, NONE } from "@/lib/schema";

export async function generateMetadata({ params }: PageProps<"/admin/certificates/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: id === "new" ? "New certificate" : "Edit certificate" };
}

export default async function EditCertificatePage({ params }: PageProps<"/admin/certificates/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const [list, courses] = await Promise.all([readCertificates(), readCollection("courses")]);
  const titles = courses.map((c) => c.title.en || c.title.ar);

  const cert = isNew ? undefined : list.find((c) => c.id === id);
  if (!isNew && !cert) notFound();
  const fields = certificateFields(titles, { course: cert?.course, grade: cert?.grade });

  let initial: Record<string, unknown>;
  let title: string;
  if (!cert) {
    const today = new Date().toISOString().slice(0, 10);
    const d = new Date();
    // Date.UTC rolls 29 Feb over to 1 Mar when the target year isn't a leap year.
    const inThreeYears = new Date(Date.UTC(d.getUTCFullYear() + 3, d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10);
    initial = { ...emptyObject(fields), status: "valid", issueDate: today, expiryDate: inThreeYears, course: NONE, grade: NONE };
    title = `New certificate · ${nextCertificateId(list, today)}`;
  } else {
    // Fill in fields an uploaded record may not have.
    initial = { ...emptyObject(fields), ...cert, course: cert.course || NONE, grade: cert.grade || NONE, status: cert.status || "valid" };
    title = `Certificate ${cert.id}`;
  }

  return (
    <ContentEditor
      key={id}
      title={title}
      fields={fields}
      initial={initial}
      save={saveCertificate.bind(null, isNew ? null : id)}
      remove={isNew ? undefined : deleteCertificate.bind(null, id)}
      backHref="/admin/certificates"
      backLabel="Certificates"
      viewUrl={isNew ? undefined : `/en/verify?id=${encodeURIComponent(id)}`}
      createdBasePath={isNew ? "/admin/certificates/" : undefined}
    />
  );
}
