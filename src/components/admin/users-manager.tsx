"use client";

import { useState } from "react";
import { KeyRound, LoaderCircle, Trash2, UserPlus } from "lucide-react";
import { createUser, deleteUser, resetUserPassword } from "@/app/admin/actions";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";

type Row = { username: string; name: string; role: "owner" | "staff"; changedAt?: string; fromServer?: boolean };

const compact = "h-10 rounded-lg md:text-sm";

export function UsersManager({ users, me }: { users: Row[]; me: string }) {
  const { pending, run } = useAdminAction();
  const empty = { name: "", username: "", role: "staff", password: "" };
  const [form, setForm] = useState(empty);
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {users.map((u) => (
            <li key={u.username} className="px-5 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-950">
                    {u.name} {u.username === me && <span className="font-normal text-slate-500">(you)</span>}
                  </p>
                  <p className="font-mono text-xs text-slate-500">{u.username}</p>
                </div>
                <StatusBadge tone={u.role === "owner" ? "info" : "neutral"}>{u.role === "owner" ? "Owner" : "Staff"}</StatusBadge>
                {u.username !== me && !u.fromServer && (
                  <>
                    <button type="button" className="admin-btn" onClick={() => setResetFor(resetFor === u.username ? null : u.username)}>
                      <KeyRound className="size-4" aria-hidden /> New password
                    </button>
                    <button
                      type="button"
                      className="admin-btn hover:border-danger-300 hover:bg-danger-50 hover:text-danger-700"
                      disabled={pending}
                      onClick={() => {
                        if (confirm(`Remove ${u.name} (${u.username})? They are signed out immediately.`)) run(() => deleteUser(u.username));
                      }}
                      aria-label={`Remove ${u.name}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </>
                )}
              </div>
              {u.fromServer && <p className="mt-1 text-xs text-slate-500">Main owner account from the server settings. It can&apos;t be removed.</p>}
              {resetFor === u.username && (
                <form
                  className="mt-3 flex flex-wrap items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(() => resetUserPassword(u.username, newPassword), {
                      after: () => {
                        setResetFor(null);
                        setNewPassword("");
                      },
                    });
                  }}
                >
                  <Field id={`reset-${u.username}`} label={`New password for ${u.name}`} className="min-w-56 flex-1">
                    <Input
                      id={`reset-${u.username}`}
                      type="text"
                      autoComplete="off"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={compact}
                    />
                  </Field>
                  <button type="submit" className="btn-primary rounded-lg px-4 py-2" disabled={pending || !newPassword}>
                    Set password
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-display mb-4 inline-flex items-center gap-2 font-bold">
          <UserPlus className="size-4 text-brand-600" aria-hidden /> Add a user
        </h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => createUser(form), { after: () => setForm(empty) });
          }}
        >
          <Field id="nu-name" label="Name">
            <Input id="nu-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={compact} />
          </Field>
          <Field id="nu-username" label="Username" help="Lowercase letters, numbers, dots or dashes. Used to sign in.">
            <Input
              id="nu-username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value.toLowerCase() }))}
              autoComplete="off"
              className={compact}
              aria-describedby="nu-username-help"
            />
          </Field>
          <Field id="nu-role" label="Role" help="Owners also manage users and see the activity log.">
            <Select value={form.role} onValueChange={(role) => setForm((f) => ({ ...f, role }))}>
              <SelectTrigger id="nu-role" className={compact}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id="nu-password" label="First password" help="At least 10 characters. Share it privately; they can change it under Account.">
            <Input
              id="nu-password"
              type="text"
              autoComplete="off"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className={compact}
              aria-describedby="nu-password-help"
            />
          </Field>
          <button type="submit" className="btn-primary rounded-lg px-4 py-2" disabled={pending}>
            {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
            Add user
          </button>
        </form>
      </section>
    </div>
  );
}
