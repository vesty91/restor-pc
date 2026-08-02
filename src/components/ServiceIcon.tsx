import {
  Cpu,
  HardDrive,
  Laptop,
  Lock,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Wrench,
  Cpu,
  ShieldCheck,
  RefreshCw,
  HardDrive,
  Lock,
  Monitor,
  Laptop,
  Sparkles,
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = map[name] ?? Wrench;
  return <Icon className={className} aria-hidden />;
}
