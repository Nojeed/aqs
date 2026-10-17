"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Mail, MessageCircle } from "lucide-react";

/** No backend needed: composes the message and hands it to WhatsApp or the visitor's mail app. */
type Props = {
  email: string;
  whatsapp: string;
  labels: { name: string; yourEmail: string; message: string; sendWhatsapp: string; sendEmail: string };
  initialMessage?: string;
};

/** Prefills the message from ?subject= (used by the "Enroll" and "Request a consultation" buttons). */
export function ContactFormFromUrl(props: Omit<Props, "initialMessage">) {
  const subject = useSearchParams().get("subject") ?? "";
  return <ContactForm key={subject} {...props} initialMessage={subject ? `${subject}\n\n` : ""} />;
}

export function ContactForm({ email, whatsapp, labels, initialMessage = "" }: Props) {
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const body = `${message}\n\n— ${name}${from ? ` (${from})` : ""}`;
  const ready = name.trim() && message.trim();
  const wa = whatsapp.replace(/\D/g, "");

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">{labels.name}</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-slate-700">{labels.yourEmail}</span>
          <input className="input" type="email" value={from} onChange={(e) => setFrom(e.target.value)} dir="ltr" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">{labels.message}</span>
        <textarea
          className="input min-h-40"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>
      <div className="flex flex-wrap gap-3 pt-2">
        {wa && (
          <a
            aria-disabled={!ready}
            href={ready ? `https://wa.me/${wa}?text=${encodeURIComponent(body)}` : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn bg-[#1f9d55] text-white hover:bg-[#178246] ${ready ? "" : "pointer-events-none opacity-50"}`}
          >
            <MessageCircle className="size-4" aria-hidden />
            {labels.sendWhatsapp}
          </a>
        )}
        {email && (
          <a
            aria-disabled={!ready}
            href={
              ready
                ? `mailto:${email}?subject=${encodeURIComponent(`AQS – ${name}`)}&body=${encodeURIComponent(body)}`
                : undefined
            }
            className={`btn-primary ${ready ? "" : "pointer-events-none opacity-50"}`}
          >
            <Mail className="size-4" aria-hidden />
            {labels.sendEmail}
          </a>
        )}
      </div>
    </form>
  );
}
