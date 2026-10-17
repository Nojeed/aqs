import {
  Award,
  BadgeCheck,
  BookOpen,
  ClipboardCheck,
  Factory,
  FileCheck2,
  FlaskConical,
  Globe,
  GraduationCap,
  Handshake,
  Leaf,
  Lightbulb,
  LineChart,
  Microscope,
  SearchCheck,
  ShieldCheck,
  Target,
  Thermometer,
  Users,
  Utensils,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/lib/schema";

const map: Record<IconName, React.ComponentType<LucideProps>> = {
  Award,
  BadgeCheck,
  BookOpen,
  ClipboardCheck,
  Factory,
  FileCheck2,
  FlaskConical,
  Globe,
  GraduationCap,
  Handshake,
  Leaf,
  Lightbulb,
  LineChart,
  Microscope,
  SearchCheck,
  ShieldCheck,
  Target,
  Thermometer,
  Users,
  Utensils,
};

export function Icon({ name, ...props }: { name: IconName | string } & LucideProps) {
  const Component = map[name as IconName] ?? ShieldCheck;
  return <Component aria-hidden {...props} />;
}
