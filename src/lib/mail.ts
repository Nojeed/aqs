import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import type { Message, Registration } from "@/lib/schema";
import { siteUrl } from "@/lib/seo";

/**
 * Optional email via SMTP (Hostinger's email works). Off unless SMTP_HOST, SMTP_USER and SMTP_PASS are set.
 * Staff alerts go to ALERT_EMAIL (default: SMTP_USER). Plain text only, so visitor input can't inject HTML.
 */
const env = process.env;
export const mailConfigured = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

let transport: Transporter | null = null;
function getTransport() {
  const port = Number(env.SMTP_PORT || 465);
  transport ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transport;
}

// Newlines in a header (e.g. a name in the subject) could add extra headers.
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

async function send(to: string | undefined, subject: string, text: string, replyTo?: string) {
  if (!mailConfigured || !to) return;
  try {
    await getTransport().sendMail({ from: env.SMTP_FROM || env.SMTP_USER, to, subject: oneLine(subject), text, replyTo });
  } catch (error) {
    // Never lose a submission over email: it's already saved and shows in the admin.
    console.error("[mail] could not send:", (error as Error).message);
  }
}

const staff = () => env.ALERT_EMAIL || env.SMTP_USER;

export async function sendRegistrationEmails(r: Registration) {
  const who = r.type === "company" ? `${r.company} (${r.trainees} trainees), contact ${r.name}` : r.name;
  await send(
    staff(),
    `New registration: ${r.company || r.name} – ${r.courseTitle}`,
    [
      `Course: ${r.courseTitle}`,
      `Registering as: ${r.type === "company" ? "Company" : "Individual"}`,
      `Name: ${who}`,
      `Email: ${r.email}`,
      `Phone: ${r.phone}`,
      r.notes ? `Notes: ${r.notes}` : "",
      "",
      `Open in the admin: ${siteUrl}/admin/registrations/${r.id}`,
    ]
      .filter((l) => l !== null)
      .join("\n"),
    r.email,
  );
  await send(
    r.email,
    r.locale === "ar" ? "استلمنا طلب تسجيلك – AQS" : "We received your registration – AQS",
    r.locale === "ar"
      ? `مرحبًا ${r.name}،\n\nشكرًا لتسجيلك في: ${r.courseTitle}.\nسيتواصل معك فريق AQS قريبًا لتأكيد التسجيل.\n\nAQS – المهارات المتقدمة للجودة\n${siteUrl}/ar`
      : `Hello ${r.name},\n\nThank you for registering for: ${r.courseTitle}.\nThe AQS team will contact you shortly to confirm.\n\nAQS – Advanced Quality Skills\n${siteUrl}/en`,
  );
}

export async function sendMessageEmails(m: Message) {
  await send(
    staff(),
    `New message from ${m.name}`,
    [`From: ${m.name} <${m.email}>`, m.phone ? `Phone: ${m.phone}` : "", "", m.message, "", `Open in the admin: ${siteUrl}/admin/messages/${m.id}`].join("\n"),
    m.email,
  );
  await send(
    m.email,
    m.locale === "ar" ? "استلمنا رسالتك – AQS" : "We received your message – AQS",
    m.locale === "ar"
      ? `مرحبًا ${m.name}،\n\nشكرًا لتواصلك مع AQS. سنرد عليك في أقرب وقت.\n\nAQS – المهارات المتقدمة للجودة\n${siteUrl}/ar`
      : `Hello ${m.name},\n\nThanks for getting in touch with AQS. We'll reply as soon as we can.\n\nAQS – Advanced Quality Skills\n${siteUrl}/en`,
  );
}
