"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Building2, CircleCheck, LoaderCircle, ShieldCheck, User } from "lucide-react";
import { register, type RegisterResult } from "@/app/[lang]/actions";
import { Field, fieldAria } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { dir, formatDate, getDictionary, t, type L10n, type Locale } from "@/lib/i18n";
import { motion } from "motion/react";
import { easeLuxe } from "@/lib/motion";

const empty = { type: "individual", courseId: "", session: "", name: "", company: "", trainees: "5", email: "", phone: "", notes: "" };

// Note for the dropdowns below: React resets the form after every submit, and Radix Select answers a form
// reset by reporting an empty value. Ignoring "" keeps the visitor's choice when the server sends back an error.
type Availability = { key: string; date: string; location: L10n; left: number | null };

/** Pass `courseId` on a course page, or `courses` to let the visitor pick one (or custom training). */
type Props = { locale: Locale; courseId?: string; courses?: { id: string; title: string }[] };

export function RegistrationForm(props: Props) {
  // "Register someone else" needs a fresh action state, so it remounts the form.
  const [round, setRound] = useState(0);
  return <Form key={round} {...props} onAnother={() => setRound((n) => n + 1)} />;
}

function Form({ locale, courseId, courses, onAnother }: Props & { onAnother: () => void }) {
  const r = getDictionary(locale).register;
  const [values, setValues] = useState({ ...empty, courseId: courses?.[0]?.id ?? "custom" });
  const [result, action, pending] = useActionState<RegisterResult | null, FormData>(register, null);
  // Dates and seats for the chosen course, fetched live (course pages are pre-rendered, seats change).
  const activeCourse = courses ? values.courseId : courseId;
  const [availability, setAvailability] = useState<{ course: string; sessions: Availability[] } | null>(null);
  useEffect(() => {
    if (!activeCourse || activeCourse === "custom") return;
    let live = true;
    fetch(`/api/sessions?course=${encodeURIComponent(activeCourse)}`)
      .then((res) => (res.ok ? res.json() : { sessions: [] }))
      .then((data: { sessions: Availability[] }) => live && setAvailability({ course: activeCourse, sessions: data.sessions }))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [activeCourse, result]);
  const sessions = availability && availability.course === activeCourse ? availability.sessions : [];
  const allFull = sessions.length > 0 && sessions.every((x) => x.left === 0);
  const session = sessions.some((x) => x.key === values.session && x.left !== 0) ? values.session : "";
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  // After a submit: bring the success message into view, or put the cursor in the first field with an error.
  useEffect(() => {
    if (result?.ok) successRef.current?.focus({ preventScroll: true });
    if (result?.ok) successRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    else if (result) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus();
  }, [result]);

  if (result?.ok) {
    return (
      <motion.div
        ref={successRef}
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
        transition={{ duration: 0.8, ease: easeLuxe }}
        tabIndex={-1}
        role="status"
        className="flex scroll-mt-28 flex-col items-start gap-4 rounded-3xl bg-success-50 p-8 ring-1 ring-success-200">
        <CircleCheck className="size-10 text-success-600" strokeWidth={1.6} aria-hidden />
        <div>
          <p className="font-display text-xl font-bold text-success-900">{r.success}</p>
          <p className="mt-1 text-success-800">{r.successText}</p>
        </div>
        <button type="button" className="btn-outline" onClick={onAnother}>
          {r.another}
        </button>
      </motion.div>
    );
  }

  const set = (key: keyof typeof empty) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));
  const fieldError = result && !result.ok ? result.fields : undefined;
  const isCompany = values.type === "company";

  const input = (key: "name" | "company" | "email" | "phone", label: string, props: React.ComponentProps<"input"> = {}) => {
    const error = fieldError?.[key] && r.errors[fieldError[key]];
    const id = `reg-${key}`;
    return (
      <Field id={id} label={label} error={error}>
        <Input name={key} value={values[key]} onChange={set(key)} required {...fieldAria(id, { error })} {...props} />
      </Field>
    );
  };

  return (
    <form ref={formRef} action={action} noValidate className="space-y-5">
      {courses ? (
        <Field id="reg-course" label={r.course}>
          <Select name="courseId" value={values.courseId} onValueChange={(v) => v && setValues((s) => ({ ...s, courseId: v, session: "" }))} dir={dir(locale)}>
            <SelectTrigger id="reg-course">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
              <SelectItem value="custom">{r.custom}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      ) : (
        <input type="hidden" name="courseId" value={courseId} />
      )}
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="session" value={session} />
      {sessions.length > 0 &&
        (allFull ? (
          <p role="status" className="rounded-xl bg-warning-50 p-4 text-sm font-medium text-warning-800 ring-1 ring-warning-200">
            {r.allFull}
          </p>
        ) : (
          <Field id="reg-session" label={r.session} error={fieldError?.session && r.errors[fieldError.session]}>
            <Select value={session || undefined} onValueChange={(v) => v && setValues((x) => ({ ...x, session: v }))} dir={dir(locale)}>
              <SelectTrigger {...fieldAria("reg-session", { error: fieldError?.session })}>
                <SelectValue placeholder={r.chooseSession} />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((x) => (
                  <SelectItem key={x.key} value={x.key} disabled={x.left === 0}>
                    <span className="flex items-center gap-3">
                      <span>
                        {formatDate(x.date, locale)}
                        {t(x.location, locale) && ` · ${t(x.location, locale)}`}
                      </span>
                      {x.left !== null && (
                        <span className={`text-xs ${x.left === 0 ? "font-semibold text-danger-600" : x.left <= 5 ? "font-semibold text-warning-700" : "text-slate-500"}`}>
                          {x.left === 0 ? r.full : `${x.left} ${r.seatsLeft}`}
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ))}
      {/* Honeypot: hidden from people and assistive tech, filled in by bots. */}
      <div className="absolute -start-[9999px] size-px overflow-hidden" aria-hidden>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-700">{r.as}</legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["individual", r.individual, User],
              ["company", r.company, Building2],
            ] as const
          ).map(([value, label, Icon]) => (
            <label
              key={value}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 shadow-xs transition hover:border-brand-300 hover:bg-brand-50/60 has-checked:border-brand-700 has-checked:bg-brand-50 has-checked:text-brand-900 has-checked:ring-4 has-checked:ring-brand-100 has-focus-visible:outline-2 has-focus-visible:outline-accent-500"
            >
              <input
                type="radio"
                name="type"
                value={value}
                checked={values.type === value}
                onChange={set("type")}
                className="sr-only"
              />
              <Icon className="size-5 text-brand-600" aria-hidden />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {isCompany && (
        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          {input("company", r.companyName, { autoComplete: "organization" })}
          <Field id="reg-trainees" label={r.trainees}>
            <Input
              id="reg-trainees"
              name="trainees"
              type="number"
              min={1}
              max={500}
              value={values.trainees}
              onChange={set("trainees")}
              className="tabular-nums"
              dir="ltr"
            />
          </Field>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {input("name", isCompany ? r.contactName : r.name, { autoComplete: "name" })}
        {input("phone", r.phone, { type: "tel", autoComplete: "tel", dir: "ltr", inputMode: "tel" })}
      </div>
      {input("email", r.email, { type: "email", autoComplete: "email", dir: "ltr" })}

      <Field id="reg-notes" label={r.notes}>
        <Textarea id="reg-notes" name="notes" value={values.notes} onChange={set("notes")} rows={3} maxLength={2000} />
      </Field>

      {result && !result.ok && result.error && (
        <p role="alert" tabIndex={-1} className="rounded-xl bg-danger-50 p-3 text-sm font-medium text-danger-700 ring-1 ring-danger-200 outline-none">
          {r.errors[result.error]}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <button type="submit" disabled={pending || allFull} className="btn-primary shrink-0">
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {pending ? r.sending : r.submit}
        </button>
        <p className="inline-flex items-start gap-2 text-xs leading-5 text-slate-500">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
          {r.privacy}
        </p>
      </div>
    </form>
  );
}
