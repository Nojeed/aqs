"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { changeOwnPassword } from "@/app/admin/actions";
import { useAdminAction } from "@/components/admin/use-admin-action";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AccountForm() {
  const { pending, run } = useAdminAction();
  const [v, setV] = useState({ current: "", next: "", confirm: "" });
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }));
  return (
    <form
      className="max-w-md space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (v.next !== v.confirm) {
          toast.error("The new passwords don't match.");
          return;
        }
        run(() => changeOwnPassword(v.current, v.next), { after: () => setV({ current: "", next: "", confirm: "" }) });
      }}
    >
      <Field id="pw-current" label="Current password">
        <Input id="pw-current" type="password" autoComplete="current-password" value={v.current} onChange={set("current")} required />
      </Field>
      <Field id="pw-next" label="New password" help="At least 10 characters. A short sentence is easy to remember and hard to guess.">
        <Input id="pw-next" type="password" autoComplete="new-password" value={v.next} onChange={set("next")} required aria-describedby="pw-next-help" />
      </Field>
      <Field id="pw-confirm" label="New password again">
        <Input id="pw-confirm" type="password" autoComplete="new-password" value={v.confirm} onChange={set("confirm")} required />
      </Field>
      <button type="submit" className="btn-primary rounded-lg px-4 py-2" disabled={pending || !v.current || !v.next}>
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        Change password
      </button>
    </form>
  );
}
