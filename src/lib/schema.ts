/**
 * Content schema shared by the admin editor (client) and the save actions (server).
 * The editor renders forms from these definitions and the server uses the same
 * definitions to sanitize whatever the browser sends before writing it to disk.
 */
import type { L10n, Locale } from "./i18n";

type Base = { label: string; help?: string };

export type Field =
  | (Base & { kind: "text"; localized?: boolean; placeholder?: string })
  | (Base & { kind: "textarea"; localized?: boolean; rows?: number })
  | (Base & { kind: "markdown"; localized?: boolean })
  | (Base & { kind: "url"; placeholder?: string })
  | (Base & { kind: "image" })
  | (Base & { kind: "number" })
  | (Base & { kind: "date" })
  | (Base & { kind: "boolean" })
  | (Base & { kind: "select"; options: { value: string; label: string }[] })
  | (Base & { kind: "object"; fields: Fields })
  | (Base & { kind: "list"; of: Field; itemLabel?: string; max?: number });

export type Fields = Record<string, Field>;

export const ICONS = [
  "ShieldCheck",
  "ClipboardCheck",
  "GraduationCap",
  "FlaskConical",
  "Microscope",
  "Factory",
  "Award",
  "BadgeCheck",
  "Utensils",
  "FileCheck2",
  "Users",
  "Leaf",
  "Thermometer",
  "SearchCheck",
  "BookOpen",
  "Target",
  "Globe",
  "Handshake",
  "Lightbulb",
  "LineChart",
] as const;
export type IconName = (typeof ICONS)[number];

// "ClipboardCheck" -> "Clipboard check" for the dropdown (the admin also sees the icon itself).
const iconLabel = (name: string) => {
  const words = name.replace(/([a-z])([A-Z0-9])/g, "$1 $2").split(" ");
  return [words[0], ...words.slice(1).map((w) => w.toLowerCase())].join(" ");
};

const iconField = (label = "Icon"): Field => ({
  kind: "select",
  label,
  options: ICONS.map((i) => ({ value: i, label: iconLabel(i) })),
});

const l = (label: string, help?: string): Field => ({ kind: "text", label, localized: true, help });
const la = (label: string, rows = 3, help?: string): Field => ({
  kind: "textarea",
  label,
  localized: true,
  rows,
  help,
});

/* ---------------------------------------------------------------- site */

const cta: Field = {
  kind: "object",
  label: "Button",
  fields: { label: l("Label"), href: { kind: "url", label: "Link", placeholder: "/courses" } },
};

export const siteFields: Fields = {
  brand: {
    kind: "object",
    label: "Brand",
    fields: {
      name: { kind: "text", label: "Short name" },
      fullName: l("Full name"),
      tagline: l("Tagline"),
    },
  },
  hero: {
    kind: "object",
    label: "Hero section",
    fields: {
      badge: l("Badge (small text above the title)"),
      title: l("Title"),
      highlight: l("Highlighted part of the title", "Shown on a new line in the accent color."),
      subtitle: la("Subtitle"),
      image: { kind: "image", label: "Background image" },
      primaryCta: { ...cta, label: "Primary button" },
      secondaryCta: { ...cta, label: "Secondary button" },
      pillars: {
        kind: "list",
        label: "Highlights under the buttons",
        itemLabel: "Highlight",
        max: 4,
        of: { kind: "object", label: "Highlight", fields: { icon: iconField(), label: l("Text") } },
      },
    },
  },
  stats: {
    kind: "list",
    label: "Numbers bar",
    itemLabel: "Number",
    max: 4,
    of: {
      kind: "object",
      label: "Number",
      fields: { value: { kind: "text", label: "Value", placeholder: "1500+" }, label: l("Label") },
    },
  },
  about: {
    kind: "object",
    label: "About section",
    fields: {
      title: l("Title"),
      body: la("Text", 5),
      points: { kind: "list", label: "Checklist points", itemLabel: "Point", of: l("Point") },
      image: { kind: "image", label: "Main image" },
      imageSecondary: { kind: "image", label: "Second image" },
      badgeValue: { kind: "text", label: "Badge value", placeholder: "10+" },
      badgeLabel: l("Badge label"),
    },
  },
  sections: {
    kind: "object",
    label: "Home page section headings",
    fields: {
      servicesTitle: l("Services title"),
      servicesSubtitle: la("Services subtitle", 2),
      coursesTitle: l("Courses title"),
      coursesSubtitle: la("Courses subtitle", 2),
      whyTitle: l("Why-us title"),
      whySubtitle: la("Why-us subtitle", 2),
      standardsTitle: l("Standards strip title"),
      blogTitle: l("Blog title"),
      blogSubtitle: la("Blog subtitle", 2),
    },
  },
  why: {
    kind: "list",
    label: "Why choose us",
    itemLabel: "Reason",
    max: 8,
    of: {
      kind: "object",
      label: "Reason",
      fields: { icon: iconField(), title: l("Title"), text: la("Text", 2) },
    },
  },
  standards: {
    kind: "list",
    label: "Standards strip",
    itemLabel: "Standard",
    help: "Short names such as ISO 22000 or HACCP.",
    of: { kind: "text", label: "Standard" },
  },
  verifyCta: {
    kind: "object",
    label: "Certificate verification banner",
    fields: { title: l("Title"), text: la("Text", 2) },
  },
  contactCta: {
    kind: "object",
    label: "Bottom call-to-action",
    fields: { title: l("Title"), text: la("Text", 2), button: { ...cta, label: "Button" } },
  },
  contact: {
    kind: "object",
    label: "Contact details",
    fields: {
      email: { kind: "text", label: "Email" },
      phone: { kind: "text", label: "Phone (display)" },
      whatsapp: {
        kind: "text",
        label: "WhatsApp number",
        help: "International format, digits only, e.g. 966500000000",
      },
      address: l("Address"),
      hours: l("Working hours"),
      mapUrl: { kind: "url", label: "Google Maps link" },
    },
  },
  social: {
    kind: "object",
    label: "Social media links",
    help: "Leave empty to hide.",
    fields: {
      facebook: { kind: "url", label: "Facebook" },
      instagram: { kind: "url", label: "Instagram" },
      linkedin: { kind: "url", label: "LinkedIn" },
      youtube: { kind: "url", label: "YouTube" },
      x: { kind: "url", label: "X (Twitter)" },
      tiktok: { kind: "url", label: "TikTok" },
    },
  },
  seo: {
    kind: "object",
    label: "Search engines (SEO)",
    fields: {
      title: l("Site title"),
      description: la("Site description", 2),
    },
  },
};

/* ---------------------------------------------------------- collections */

const commonTop: Fields = {
  title: l("Title"),
  slug: {
    kind: "text",
    label: "URL slug",
    help: "Lowercase English letters, numbers and dashes. Leave empty to generate it from the English title.",
    placeholder: "haccp-level-3",
  },
};

const publishFields: Fields = {
  published: { kind: "boolean", label: "Published", help: "Unpublished items are hidden from the website." },
};

export const serviceFields: Fields = {
  ...commonTop,
  icon: iconField(),
  summary: la("Short summary", 3, "Shown on cards."),
  image: { kind: "image", label: "Image" },
  features: { kind: "list", label: "What's included", itemLabel: "Item", of: l("Item") },
  body: { kind: "markdown", label: "Full description", localized: true },
  order: { kind: "number", label: "Display order", help: "Lower numbers appear first." },
  ...publishFields,
};

export const courseFields: Fields = {
  ...commonTop,
  summary: la("Short summary", 3, "Shown on cards."),
  image: { kind: "image", label: "Image" },
  category: l("Category", "e.g. HACCP, ISO 22000, Hygiene"),
  level: {
    kind: "select",
    label: "Level",
    options: [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ],
  },
  format: {
    kind: "select",
    label: "Format",
    options: [
      { value: "inPerson", label: "In person" },
      { value: "online", label: "Online" },
      { value: "hybrid", label: "Hybrid" },
    ],
  },
  duration: l("Duration", "e.g. 24 hours / 3 days"),
  price: { kind: "text", label: "Fee", help: "Leave empty to show “On request”.", placeholder: "1,500 SAR" },
  startDate: { kind: "date", label: "Next start date", help: "Optional. Used only when no dates are listed under “Dates and seats”." },
  sessions: {
    kind: "list",
    label: "Dates and seats",
    help: "Each date visitors can register for. The registration form shows the upcoming ones with seats left; full dates can't be picked.",
    itemLabel: "Date",
    of: {
      kind: "object",
      label: "Date",
      fields: {
        date: { kind: "date", label: "Start date" },
        location: l("Place / time", "e.g. Cairo · 9:00–15:00, or Online"),
        seats: { kind: "number", label: "Seats", help: "0 = no limit." },
      },
    },
  },
  outcomes: { kind: "list", label: "Learning outcomes", itemLabel: "Outcome", of: l("Outcome") },
  audience: la("Who should attend", 3),
  body: { kind: "markdown", label: "Full description", localized: true },
  featured: { kind: "boolean", label: "Show on home page" },
  order: { kind: "number", label: "Display order", help: "Lower numbers appear first." },
  ...publishFields,
};

export const postFields: Fields = {
  ...commonTop,
  excerpt: la("Excerpt", 3, "Shown on cards and in search results."),
  cover: { kind: "image", label: "Cover image" },
  category: l("Category"),
  author: { kind: "text", label: "Author" },
  date: { kind: "date", label: "Publish date" },
  body: { kind: "markdown", label: "Article", localized: true },
  ...publishFields,
};

/** Grades staff can pick; the Arabic text is filled in automatically. */
export const GRADES = [
  { en: "Excellent", ar: "ممتاز" },
  { en: "Very good", ar: "جيد جدًا" },
  { en: "Good", ar: "جيد" },
  { en: "Pass", ar: "مقبول" },
] as const;

/** Select value meaning "leave empty" (Radix select items can't use an empty value). */
export const NONE = "none";

/**
 * Form for one record in certificates.json. The number is generated on create and never edited.
 * Course and grade are dropdowns; the server fills in their Arabic text. A value that isn't in the
 * list (e.g. from an uploaded file) is kept as an extra option so editing never loses it.
 */
export function certificateFields(courseTitles: string[], current: { course?: string; grade?: string } = {}): Fields {
  const options = (list: readonly string[], value?: string) =>
    [...list, ...(value && !list.includes(value) ? [value] : [])].map((v) => ({ value: v, label: v }));
  return {
    status: {
      kind: "select",
      label: "Status",
      help: "Revoked certificates show as not valid on the verification page.",
      options: [
        { value: "valid", label: "Valid until the expiry date" },
        { value: "lifetime", label: "Valid – never expires" },
        { value: "revoked", label: "Revoked" },
      ],
    },
    name: { kind: "text", label: "Trainee name (English)" },
    nameAr: { kind: "text", label: "Trainee name (Arabic)", help: "Optional. If empty, the English name is shown on the Arabic page." },
    course: {
      kind: "select",
      label: "Course",
      help: "The Arabic course name is filled in from the course page.",
      options: [{ value: NONE, label: "Not set" }, ...options(courseTitles, current.course)],
    },
    issueDate: { kind: "date", label: "Issue date" },
    expiryDate: {
      kind: "date",
      label: "Expiry date",
      help: "Not used when the status is “Valid – never expires”. After this date the certificate shows as expired.",
    },
    hours: { kind: "number", label: "Training hours" },
    grade: {
      kind: "select",
      label: "Grade",
      help: "The Arabic grade is filled in automatically.",
      options: [{ value: NONE, label: "No grade" }, ...options(GRADES.map((g) => g.en), current.grade)],
    },
  };
}

export const collections = {
  services: { label: "Services", singular: "service", file: "services.json", fields: serviceFields },
  courses: { label: "Courses", singular: "course", file: "courses.json", fields: courseFields },
  posts: { label: "Blog posts", singular: "post", file: "posts.json", fields: postFields },
} as const;

export type CollectionName = keyof typeof collections;

export function isCollection(name: string): name is CollectionName {
  return Object.hasOwn(collections, name);
}

/* --------------------------------------------------------------- types */

export type Cta = { label: L10n; href: string };

export type Site = {
  brand: { name: string; fullName: L10n; tagline: L10n };
  hero: {
    badge: L10n;
    title: L10n;
    highlight: L10n;
    subtitle: L10n;
    image: string;
    primaryCta: Cta;
    secondaryCta: Cta;
    pillars: { icon: IconName; label: L10n }[];
  };
  stats: { value: string; label: L10n }[];
  about: {
    title: L10n;
    body: L10n;
    points: L10n[];
    image: string;
    imageSecondary: string;
    badgeValue: string;
    badgeLabel: L10n;
  };
  sections: Record<
    | "servicesTitle"
    | "servicesSubtitle"
    | "coursesTitle"
    | "coursesSubtitle"
    | "whyTitle"
    | "whySubtitle"
    | "standardsTitle"
    | "blogTitle"
    | "blogSubtitle",
    L10n
  >;
  why: { icon: IconName; title: L10n; text: L10n }[];
  standards: string[];
  verifyCta: { title: L10n; text: L10n };
  contactCta: { title: L10n; text: L10n; button: Cta };
  contact: { email: string; phone: string; whatsapp: string; address: L10n; hours: L10n; mapUrl: string };
  social: Record<"facebook" | "instagram" | "linkedin" | "youtube" | "x" | "tiktok", string>;
  seo: { title: L10n; description: L10n };
};

type ItemBase = { id: string; slug: string; title: L10n; body: L10n; published: boolean };

export type Service = ItemBase & {
  icon: IconName;
  summary: L10n;
  image: string;
  features: L10n[];
  order: number;
};

export type Course = ItemBase & {
  summary: L10n;
  image: string;
  category: L10n;
  level: "beginner" | "intermediate" | "advanced";
  format: "inPerson" | "online" | "hybrid";
  duration: L10n;
  price: string;
  startDate: string;
  sessions?: CourseSession[];
  outcomes: L10n[];
  audience: L10n;
  featured: boolean;
  order: number;
};

export type Post = ItemBase & {
  excerpt: L10n;
  cover: string;
  category: L10n;
  author: string;
  date: string;
};

export type CollectionItem = { services: Service; courses: Course; posts: Post };

export type CourseSession = { date: string; location: L10n; seats: number };

/** Identifies a session in registrations: the date, plus the place when there is one (two sessions can share a date). */
export const sessionKey = (s: CourseSession) => (s.location?.en ? `${s.date} · ${s.location.en}` : s.date);

/** Sessions starting today or later, soonest first. */
export function upcomingSessions(sessions: CourseSession[] | undefined, today = new Date().toISOString().slice(0, 10)) {
  return (sessions ?? []).filter((s) => s.date && s.date >= today).sort((a, b) => a.date.localeCompare(b.date));
}

/** Every data file the admin can restore from a backup, with a readable name. */
export const DATA_FILES = {
  "site.json": "Site content",
  "services.json": "Services",
  "courses.json": "Courses",
  "posts.json": "Blog posts",
  "certificates.json": "Certificates",
  "registrations.json": "Registrations",
  "messages.json": "Messages",
} as const;

/** Staff notes and status changes on a registration or message, oldest first. */
export type HistoryEntry = { at: string; text: string };

/** Course registrations submitted from the website, stored in registrations.json. */
export const REGISTRATIONS_FILE = "registrations.json";

export const registrationStatuses = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "enrolled", label: "Enrolled" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export type RegistrationStatus = (typeof registrationStatuses)[number]["value"];

export type Registration = {
  id: string;
  createdAt: string;
  status: RegistrationStatus;
  type: "individual" | "company";
  name: string;
  email: string;
  phone: string;
  company?: string;
  trainees?: number;
  courseId: string;
  /** Snapshot, so the row still reads correctly if the course is renamed or deleted. */
  courseTitle: string;
  notes?: string;
  /** sessionKey() of the date they registered for, when the course lists dates. */
  session?: string;
  locale: Locale;
  history?: HistoryEntry[];
};

/** Messages sent from the contact page, stored in messages.json. */
export const MESSAGES_FILE = "messages.json";

export const messageStatuses = [
  { value: "new", label: "New" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
] as const;

export type Message = {
  id: string;
  createdAt: string;
  status: (typeof messageStatuses)[number]["value"];
  name: string;
  email: string;
  phone?: string;
  message: string;
  locale: Locale;
  history?: HistoryEntry[];
};

/* ------------------------------------------------------------ helpers */

const MAX_TEXT = 200_000;

function str(value: unknown, max = MAX_TEXT): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

const SAFE_URL = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;

function safeUrl(value: unknown): string {
  const v = str(value, 2000).trim();
  return v === "" || SAFE_URL.test(v) ? v : "";
}

/** Build an empty value for a field. */
export function emptyValue(field: Field): unknown {
  switch (field.kind) {
    case "text":
    case "textarea":
    case "markdown":
      return field.localized ? { ar: "", en: "" } : "";
    case "url":
    case "image":
    case "date":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "select":
      return field.options[0]?.value ?? "";
    case "object":
      return emptyObject(field.fields);
    case "list":
      return [];
  }
}

export function emptyObject(fields: Fields): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, emptyValue(f)]));
}

/** Coerce untrusted input into the exact shape described by a field. */
export function sanitize(field: Field, value: unknown): unknown {
  switch (field.kind) {
    case "text":
    case "textarea":
    case "markdown": {
      const max = field.kind === "text" ? 2000 : MAX_TEXT;
      if (!field.localized) return str(value, max);
      const v = (value ?? {}) as Partial<L10n>;
      return { ar: str(v.ar, max), en: str(v.en, max) };
    }
    case "url":
    case "image":
      return safeUrl(value);
    case "number": {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }
    case "date": {
      const v = str(value, 10);
      return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "";
    }
    case "boolean":
      return value === true || value === "true" || value === "on";
    case "select": {
      const v = str(value, 200);
      return field.options.some((o) => o.value === v) ? v : (field.options[0]?.value ?? "");
    }
    case "object":
      return sanitizeObject(field.fields, value);
    case "list": {
      const arr = Array.isArray(value) ? value : [];
      return arr.slice(0, field.max ?? 200).map((item) => sanitize(field.of, item));
    }
  }
}

export function sanitizeObject(fields: Fields, value: unknown): Record<string, unknown> {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return Object.fromEntries(Object.entries(fields).map(([k, f]) => [k, sanitize(f, v[k])]));
}

export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
