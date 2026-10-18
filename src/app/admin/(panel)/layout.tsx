import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import { AdminShortcuts } from "@/components/admin/shortcuts";
import { Sidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[16rem_1fr]">
      <Sidebar />
      <div className="min-w-0">
        <Suspense fallback={<PanelLoading />}>
          <Gate>{children}</Gate>
        </Suspense>
      </div>
      <AdminShortcuts />
    </div>
  );
}

/** Redirects to the login page when the session is missing. Pages and actions check again themselves. */
async function Gate({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}

function PanelLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
      <LoaderCircle className="size-6 animate-spin" aria-label="Loading" />
    </div>
  );
}
