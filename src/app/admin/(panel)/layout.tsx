import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import { Toaster } from "sonner";
import { InboxWatcher } from "@/components/admin/inbox-alerts";
import { AdminShortcuts } from "@/components/admin/shortcuts";
import { Sidebar } from "@/components/admin/sidebar";
import { getSession, requireAdmin } from "@/lib/auth";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[16rem_1fr]">
      <Suspense fallback={<Sidebar />}>
        <SidebarWithSession />
      </Suspense>
      <div className="min-w-0">
        <Suspense fallback={<PanelLoading />}>
          <Gate>{children}</Gate>
        </Suspense>
      </div>
      <AdminShortcuts />
      <InboxWatcher />
      {/* One place for every admin confirmation and error (see useAdminAction). */}
      <Toaster position="top-right" richColors closeButton toastOptions={{ className: "font-sans" }} />
    </div>
  );
}

async function SidebarWithSession() {
  const me = await getSession();
  return <Sidebar me={me && { name: me.name, role: me.role }} />;
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
