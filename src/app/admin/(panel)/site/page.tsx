import type { Metadata } from "next";
import { saveSite } from "@/app/admin/actions";
import { ContentEditor } from "@/components/admin/editor/content-editor";
import { requireAdmin } from "@/lib/auth";
import { readSite } from "@/lib/content";
import { filterSettings, siteFields } from "@/lib/schema";

export const metadata: Metadata = { title: "Site content" };

export default async function SiteContentPage() {
  await requireAdmin();
  const site = await readSite();
  return (
    <ContentEditor
      title="Site content"
      fields={siteFields}
      // Filters never set before show as on, matching what visitors currently see.
      initial={{ ...site, filters: filterSettings(site) } as unknown as Record<string, unknown>}
      save={saveSite}
      viewUrl="/ar"
    />
  );
}
