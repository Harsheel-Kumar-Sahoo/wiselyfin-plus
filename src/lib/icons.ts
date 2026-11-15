import { BookOpen, PiggyBank, ShieldAlert, Sprout, TrendingUp, type LucideIcon } from "lucide-react";

// Learning paths store an icon name. This turns the name into the real icon.
const ICONS: Record<string, LucideIcon> = {
  BookOpen,
  PiggyBank,
  ShieldAlert,
  Sprout,
  TrendingUp,
};

export function pathIcon(name: string): LucideIcon {
  return ICONS[name] ?? BookOpen;
}