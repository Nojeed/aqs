import "server-only";
import { lang } from "next/root-params";
import { defaultLocale, isLocale, type Locale } from "./i18n";

/** The active locale from the [lang] root segment, usable from any server component. */
export async function currentLocale(): Promise<Locale> {
  const value = await lang();
  return isLocale(value) ? value : defaultLocale;
}
