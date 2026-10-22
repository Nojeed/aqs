import type { Metadata } from "next";
import { AccountForm } from "@/components/admin/account-form";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const me = await requireAdmin();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
      <h1 className="font-display text-2xl font-bold">Account</h1>
      <p className="mt-1 text-slate-500">
        Signed in as <strong className="text-slate-700">{me.name}</strong> (<span className="font-mono text-sm">{me.username}</span>,{" "}
        {me.role === "owner" ? "owner" : "staff"}).
      </p>
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="font-display mb-4 font-bold">Change password</h2>
        <AccountForm />
      </section>
    </div>
  );
}
