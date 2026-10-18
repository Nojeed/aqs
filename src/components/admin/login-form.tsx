"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { login } from "@/app/admin/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <Field id="login-username" label="Username">
        <Input id="login-username" name="username" autoComplete="username" defaultValue="admin" required />
      </Field>
      <Field id="login-password" label="Password">
        <Input id="login-password" name="password" type="password" autoComplete="current-password" required autoFocus />
      </Field>
      {state && !state.ok && (
        <p role="alert" className="rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-700 ring-1 ring-danger-200">
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
