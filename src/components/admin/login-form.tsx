"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Username</span>
        <input name="username" className="input" autoComplete="username" defaultValue="admin" required />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Password</span>
        <input name="password" type="password" className="input" autoComplete="current-password" required autoFocus />
      </label>
      {state && !state.ok && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn-primary w-full rounded-xl" disabled={pending}>
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        Sign in
      </button>
    </form>
  );
}
