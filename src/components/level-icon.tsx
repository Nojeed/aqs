import { SignalHigh, SignalLow, SignalMedium, type LucideProps } from "lucide-react";

const icons = { beginner: SignalLow, intermediate: SignalMedium, advanced: SignalHigh } as const;

export const isLevel = (v: string): v is keyof typeof icons => v in icons;

/** Signal bars that fill up with the course level: 1 bar beginner, 2 intermediate, 3 advanced. */
export function LevelIcon({ level, ...props }: { level: string } & LucideProps) {
  const Component = isLevel(level) ? icons[level] : SignalMedium;
  return <Component aria-hidden {...props} />;
}
