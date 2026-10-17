export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";

export type L10n = { ar: string; en: string };

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export function dir(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Pick the string for a locale, falling back to the other language when empty. */
export function t(value: L10n | string | undefined | null, locale: Locale): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  const other: Locale = locale === "ar" ? "en" : "ar";
  return value[locale]?.trim() ? value[locale] : value[other] ?? "";
}

export function formatDate(iso: string, locale: Locale) {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

const dictionaries = {
  ar: {
    nav: {
      home: "الرئيسية",
      services: "خدماتنا",
      courses: "الدورات",
      blog: "المدونة",
      verify: "التحقق من الشهادات",
      contact: "تواصل معنا",
    },
    common: {
      readMore: "اقرأ المزيد",
      viewAll: "عرض الكل",
      learnMore: "تعرّف أكثر",
      details: "التفاصيل",
      enroll: "سجّل الآن",
      contactUs: "تواصل معنا",
      backTo: "العودة إلى",
      menu: "القائمة",
      close: "إغلاق",
      language: "English",
      minRead: "دقائق قراءة",
      by: "بواسطة",
      empty: "لا يوجد محتوى بعد.",
    },
    courses: {
      level: "المستوى",
      format: "طريقة التدريب",
      duration: "المدة",
      price: "الرسوم",
      startDate: "تاريخ البدء",
      category: "التصنيف",
      outcomes: "ماذا ستتعلم",
      audience: "الفئة المستهدفة",
      priceOnRequest: "حسب الطلب",
      levels: { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" },
      formats: { inPerson: "حضوري", online: "عن بُعد", hybrid: "مدمج" },
      enrollCta: "هل أنت مستعد للانضمام؟",
      enrollText: "تواصل معنا لحجز مقعدك أو لطلب تدريب مخصص لفريق عملك.",
      all: "جميع الدورات",
    },
    services: {
      includes: "ما تشمله الخدمة",
      cta: "اطلب استشارة",
      ctaText: "أخبرنا عن منشأتك واحتياجاتك وسيتواصل معك أحد خبرائنا.",
    },
    blog: {
      latest: "أحدث المقالات",
      related: "مقالات أخرى",
    },
    verify: {
      title: "التحقق من الشهادات",
      subtitle:
        "أدخل رقم الشهادة المطبوع على شهادتك للتأكد من صحتها وحالتها.",
      label: "رقم الشهادة",
      placeholder: "مثال: AQS-2026-0001",
      submit: "تحقق",
      valid: "شهادة سارية",
      validText: "هذه الشهادة صادرة عن AQS وهي سارية المفعول.",
      expired: "شهادة منتهية",
      expiredText: "هذه الشهادة صادرة عن AQS لكن انتهت صلاحيتها.",
      revoked: "شهادة ملغاة",
      revokedText: "تم إلغاء هذه الشهادة ولم تعد معتمدة.",
      notFound: "لم يتم العثور على الشهادة",
      notFoundText:
        "تأكد من كتابة الرقم كما هو مطبوع على الشهادة. إذا استمرت المشكلة تواصل معنا.",
      holder: "اسم المتدرب",
      course: "البرنامج التدريبي",
      certificateNo: "رقم الشهادة",
      issued: "تاريخ الإصدار",
      expires: "تاريخ الانتهاء",
      hours: "عدد الساعات",
      grade: "التقدير",
      checking: "جارٍ التحقق…",
      howTitle: "أين أجد رقم الشهادة؟",
      howText:
        "رقم الشهادة مطبوع أسفل الشهادة. يمكنك أيضًا مسح رمز QR الموجود عليها للوصول مباشرة إلى صفحة التحقق.",
      quickTitle: "تحقق من شهادة",
      quickText: "تأكد من صحة أي شهادة صادرة عن AQS خلال ثوانٍ.",
    },
    contact: {
      title: "تواصل معنا",
      subtitle: "يسعدنا الإجابة عن استفساراتك حول الدورات والاستشارات والتدريب المخصص.",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      whatsapp: "واتساب",
      address: "العنوان",
      hours: "ساعات العمل",
      formTitle: "أرسل لنا رسالة",
      name: "الاسم",
      yourEmail: "بريدك الإلكتروني",
      message: "رسالتك",
      sendWhatsapp: "إرسال عبر واتساب",
      sendEmail: "إرسال عبر البريد",
      follow: "تابعنا",
    },
    footer: {
      quickLinks: "روابط سريعة",
      contact: "معلومات التواصل",
      rights: "جميع الحقوق محفوظة.",
    },
    notFound: {
      title: "الصفحة غير موجودة",
      text: "عذرًا، لم نتمكن من العثور على الصفحة التي تبحث عنها.",
      home: "العودة للرئيسية",
    },
  },
  en: {
    nav: {
      home: "Home",
      services: "Services",
      courses: "Courses",
      blog: "Blog",
      verify: "Verify Certificate",
      contact: "Contact",
    },
    common: {
      readMore: "Read more",
      viewAll: "View all",
      learnMore: "Learn more",
      details: "Details",
      enroll: "Enroll now",
      contactUs: "Contact us",
      backTo: "Back to",
      menu: "Menu",
      close: "Close",
      language: "العربية",
      minRead: "min read",
      by: "By",
      empty: "Nothing here yet.",
    },
    courses: {
      level: "Level",
      format: "Format",
      duration: "Duration",
      price: "Fee",
      startDate: "Start date",
      category: "Category",
      outcomes: "What you will learn",
      audience: "Who should attend",
      priceOnRequest: "On request",
      levels: { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" },
      formats: { inPerson: "In person", online: "Online", hybrid: "Hybrid" },
      enrollCta: "Ready to join?",
      enrollText: "Contact us to reserve your seat or request in-house training for your team.",
      all: "All courses",
    },
    services: {
      includes: "What's included",
      cta: "Request a consultation",
      ctaText: "Tell us about your facility and goals, and one of our experts will get back to you.",
    },
    blog: {
      latest: "Latest articles",
      related: "More articles",
    },
    verify: {
      title: "Certificate Verification",
      subtitle: "Enter the certificate number printed on your certificate to confirm it is authentic and current.",
      label: "Certificate number",
      placeholder: "e.g. AQS-2026-0001",
      submit: "Verify",
      valid: "Valid certificate",
      validText: "This certificate was issued by AQS and is currently valid.",
      expired: "Expired certificate",
      expiredText: "This certificate was issued by AQS but has expired.",
      revoked: "Revoked certificate",
      revokedText: "This certificate has been revoked and is no longer recognised.",
      notFound: "Certificate not found",
      notFoundText:
        "Check that the number matches exactly what is printed on the certificate. If the problem persists, please contact us.",
      holder: "Holder",
      course: "Program",
      certificateNo: "Certificate No.",
      issued: "Issue date",
      expires: "Expiry date",
      hours: "Training hours",
      grade: "Grade",
      checking: "Checking…",
      howTitle: "Where do I find the number?",
      howText:
        "The certificate number is printed at the bottom of every AQS certificate. You can also scan its QR code to open this page directly.",
      quickTitle: "Verify a certificate",
      quickText: "Confirm any AQS-issued certificate in seconds.",
    },
    contact: {
      title: "Get in touch",
      subtitle: "We are happy to answer your questions about courses, consulting and in-house training.",
      email: "Email",
      phone: "Phone",
      whatsapp: "WhatsApp",
      address: "Address",
      hours: "Working hours",
      formTitle: "Send us a message",
      name: "Name",
      yourEmail: "Your email",
      message: "Message",
      sendWhatsapp: "Send via WhatsApp",
      sendEmail: "Send via email",
      follow: "Follow us",
    },
    footer: {
      quickLinks: "Quick links",
      contact: "Contact",
      rights: "All rights reserved.",
    },
    notFound: {
      title: "Page not found",
      text: "Sorry, we couldn't find the page you're looking for.",
      home: "Back to home",
    },
  },
};

export type Dictionary = (typeof dictionaries)["en"];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Prefix an internal href with the locale; leave external/anchor links untouched. */
export function localHref(href: string, locale: Locale) {
  if (!href) return `/${locale}`;
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  if (href === "/") return `/${locale}`;
  const first = href.split("/")[1];
  if (isLocale(first) || ["admin", "uploads", "images", "brand", "api"].includes(first)) return href;
  return `/${locale}${href}`;
}
