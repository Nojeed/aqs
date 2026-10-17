import Image from "next/image";
import type { ReactNode } from "react";

/** Navy title band used at the top of every inner page (sits under the transparent header). */
export function PageHero({
  title,
  subtitle,
  eyebrow,
  image,
  children,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: ReactNode;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-900 pt-36 pb-16 sm:pb-20">
      {image && (
        <Image
          src={image}
          alt=""
          fill
          priority
          sizes="100vw"
          quality={70}
          className="-z-20 object-cover opacity-25"
        />
      )}
      <div
        className="absolute inset-0 -z-10 bg-linear-to-br from-brand-950/95 via-brand-900/90 to-brand-800/70"
        aria-hidden
      />
      <div className="bg-lines absolute inset-0 -z-10" aria-hidden />
      <div className="absolute -end-32 -top-32 -z-10 size-96 rounded-full bg-accent-500/20 blur-3xl" aria-hidden />
      <div className="container-page">
        {eyebrow && <div className="mb-4 text-sm text-white/70">{eyebrow}</div>}
        <h1 className="font-display max-w-3xl text-4xl font-bold text-balance text-white sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-5 max-w-2xl text-lg leading-8 text-pretty text-white/75">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
