"use client";

import { useActionState } from "react";
import { LoaderCircle, Lock, User } from "lucide-react";
import { login } from "@/app/admin/actions";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="mt-8 space-y-4">
      <Field id="login-username" label="Username">
        <Input id="login-username" icon={User} name="username" autoComplete="username" required autoFocus />
      </Field>
      <Field id="login-password" label="Password">
        <Input id="login-password" icon={Lock} name="password" type="password" autoComplete="current-password" required />
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
