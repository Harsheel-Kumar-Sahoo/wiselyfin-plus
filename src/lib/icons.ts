import {
  Award,
  BookOpen,
  Coins,
  Flame,
  GraduationCap,
  PiggyBank,
  ShieldAlert,
  Sprout,
  Star,
  Target,
  Trophy,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

// Learning paths and badges store an icon name. This turns the name into the real icon.
const ICONS: Record<string, LucideIcon> = {
  Award,
  BookOpen,
  Coins,
  Flame,
  GraduationCap,
  PiggyBank,
  ShieldAlert,
  Sprout,
  Star,
  Target,
  Trophy,
  TrendingUp,
};

export function pathIcon(name: string): LucideIcon {
  return ICONS[name] ?? BookOpen;
}