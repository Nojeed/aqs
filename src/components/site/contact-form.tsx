"use client";

import { useActionState, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CircleCheck, LoaderCircle, Mail, MessageCircle, MessageSquareText, Phone, ShieldCheck, User } from "lucide-react";
import { sendMessage, type MessageResult } from "@/app/[lang]/actions";
import { Field, fieldAria } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDictionary, type Locale } from "@/lib/i18n";
import { retentionText } from "@/lib/retention";
import { m } from "motion/react";
import { easeLuxe } from "@/lib/motion";

// keepMonths: the admin's keep period, stated in the privacy line.
type Props = { locale: Locale; whatsapp: string; keepMonths?: number };

// ?subject= from the "Request a consultation" buttons. Read in the browser after hydration ("" on the server),
// so the form is never swapped out and nothing a visitor already typed is lost.
const noSubscribe = () => () => {};
const subjectFromUrl = () => new URLSearchParams(window.location.search).get("subject") ?? "";

/** Stores the message for the admin (Messages page). WhatsApp stays as a direct alternative. */
export function ContactForm(props: Props) {
  // "Send another" needs a fresh action state, so it remounts the form.
  const [round, setRound] = useState(0);
  return <Form key={round} {...props} onAnother={() => setRound((n) => n + 1)} />;
}

type Values = { name: string; email: string; phone: string; message: string | null };

function Form({ locale, whatsapp, keepMonths, onAnother }: Props & { onAnother: () => void }) {
  const d = getDictionary(locale);
  const c = d.contact;
  const subject = useSyncExternalStore(noSubscribe, subjectFromUrl, () => "");
  // `message` stays null until the visitor types, so the ?subject= prefill can arrive after hydration.
  const [values, setValues] = useState<Values>({ name: "", email: "", phone: "", message: null });
  const message = values.message ?? (subject ? `${subject}\n\n` : "");
  const [result, action, pending] = useActionState<MessageResult | null, FormData>(sendMessage, null);
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  // After a submit: bring the success message into view, or put the cursor in the first field with an error.
  useEffect(() => {
    if (result?.ok) successRef.current?.focus({ preventScroll: true });
    if (result?.ok) successRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    else if (result) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.focus();
  }, [result]);
  const set = (key: keyof Values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const errors = result && !result.ok ? result.fields : undefined;
  const err = (key: "name" | "email" | "message") => (errors?.[key] ? d.register.errors[errors[key]] : undefined);

  if (result?.ok) {
    return (
      <m.div
        ref={successRef}
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
        transition={{ duration: 0.8, ease: easeLuxe }}
        tabIndex={-1}
        role="status"
        className="flex scroll-mt-28 flex-col items-start gap-4 rounded-2xl bg-success-50 p-8 ring-1 ring-success-200">
        <CircleCheck className="size-10 text-success-600" strokeWidth={1.6} aria-hidden />
        <div>
          <p className="font-display text-xl font-bold text-success-900">{c.sent}</p>
          <p className="mt-1 text-success-800">{c.sentText}</p>
        </div>
        <button type="button" className="btn-outline" onClick={onAnother}>
          {c.another}
        </button>
      </m.div>
    );
  }

  return (
    <form ref={formRef} action={action} noValidate className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot: hidden from people and assistive tech, filled in by bots. */}
      <div className="absolute -start-[9999px] size-px overflow-hidden" aria-hidden>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="msg-name" label={c.name} error={err("name")}>
          <Input name="name" icon={User} value={values.name} onChange={set("name")} required autoComplete="name" {...fieldAria("msg-name", { error: err("name") })} />
        </Field>
        <Field id="msg-email" label={c.yourEmail} error={err("email")}>
          <Input
            name="email"
            icon={Mail}
            type="email"
            value={values.email}
            onChange={set("email")}
            required
            autoComplete="email"
            dir="ltr"
            {...fieldAria("msg-email", { error: err("email") })}
          />
        </Field>
      </div>
      <Field id="msg-phone" label={c.phoneOptional}>
        <Input id="msg-phone" icon={Phone} name="phone" type="tel" value={values.phone} onChange={set("phone")} autoComplete="tel" inputMode="tel" dir="ltr" />
      </Field>
      <Field id="msg-message" label={c.message} error={err("message")}>
        <Textarea
          name="message"
          icon={MessageSquareText}
          value={message}
          onChange={set("message")}
          required
          rows={6}
          maxLength={4000}
          {...fieldAria("msg-message", { error: err("message") })}
        />
      </Field>

      {result && !result.ok && result.error && (
        <p role="alert" tabIndex={-1} className="rounded-xl bg-danger-50 p-3 text-sm font-medium text-danger-700 ring-1 ring-danger-200 outline-none">
          {d.register.errors[result.error]}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {pending ? c.sending : c.send}
        </button>
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}${message.trim() ? `?text=${encodeURIComponent(message)}` : ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-whatsapp-dark transition hover:text-whatsapp hover:underline"
          >
            <MessageCircle className="size-4" aria-hidden />
            {c.orWhatsapp}
          </a>
        )}
      </div>
      <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
        {d.register.privacy} {retentionText(locale, keepMonths)}
      </p>
    </form>
  );
}
