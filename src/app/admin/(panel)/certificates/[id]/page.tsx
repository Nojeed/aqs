import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { deleteCertificate, saveCertificate } from "@/app/admin/actions";
import { ContentEditor } from "@/components/admin/editor/content-editor";
import { requireAdmin } from "@/lib/auth";
import { nextCertificateId, readCertificates } from "@/lib/certificates";
import { certificateFields, emptyObject } from "@/lib/schema";

export async function generateMetadata({ params }: PageProps<"/admin/certificates/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: id === "new" ? "New certificate" : "Edit certificate" };
}

export default async function EditCertificatePage({ params }: PageProps<"/admin/certificates/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "new";
  const list = await readCertificates();

  let initial: Record<string, unknown>;
  let title: string;
  if (isNew) {
    const today = new Date().toISOString().slice(0, 10);
    initial = { ...emptyObject(certificateFields), status: "valid", issueDate: today };
    title = `New certificate · ${nextCertificateId(list, today)}`;
  } else {
    const cert = list.find((c) => c.id === id);
    if (!cert) notFound();
    // Fill in fields an uploaded record may not have.
    initial = { ...emptyObject(certificateFields), ...cert };
    title = `Certificate ${cert.id}`;
  }

  return (
    <ContentEditor
      key={id}
      title={title}
      fields={certificateFields}
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
