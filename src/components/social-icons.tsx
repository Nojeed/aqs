import type { SVGProps } from "react";

/** Minimal line-style brand marks that sit comfortably next to lucide icons. */
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const icons = {
  facebook: (
    <path d="M15.5 3.5H14c-2.2 0-3.5 1.4-3.5 3.6V10H8v3h2.5v7.5h3V13H16l.5-3h-3V7.6c0-.7.4-1.1 1.1-1.1h.9z" />
  ),
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V17M8 7.25v.01M12 17v-6.5M12 13.5c0-1.8 1.1-3 2.7-3s2.3 1.1 2.3 2.8V17" />
    </>
  ),
  youtube: (
    <>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="m10.5 9.5 4 2.5-4 2.5z" fill="currentColor" />
    </>
  ),
  x: <path d="M4 4h4.2L20 20h-4.2zM19.5 4l-6.4 7.1M4.5 20l6.4-7.1" />,
  tiktok: <path d="M14 3.5v11a3.5 3.5 0 1 1-3.5-3.5M14 3.5c.4 2.5 2.4 4.4 5 4.6" />,
} as const;

export type SocialName = keyof typeof icons;
export const socialNames = Object.keys(icons) as SocialName[];

export function SocialIcon({ name, ...props }: { name: SocialName } & SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} aria-hidden {...props}>
      {icons[name]}
    </svg>
  );
}
