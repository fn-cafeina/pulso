import { Home, Stethoscope, ClipboardList, MapPin, Calendar, AlertTriangle, Bell, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const sidebarItems: NavItem[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/asistente", label: "Asistente IA", icon: Stethoscope },
  { href: "/historial", label: "Mi Historial", icon: ClipboardList },
  { href: "/servicios", label: "Servicios Cercanos", icon: MapPin },
  { href: "/eventos", label: "Eventos", icon: Calendar },
  { href: "/alertas", label: "Alertas", icon: AlertTriangle },
  { href: "/recordatorios", label: "Recordatorios", icon: Bell },
];

export const bottomItems: NavItem[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/asistente", label: "Asistente", icon: Stethoscope },
  { href: "/servicios", label: "Servicios", icon: MapPin },
  { href: "/historial", label: "Historial", icon: ClipboardList },
];

export function isActive(currentPath: string, href: string): boolean {
  if (href === "/") return currentPath === "/";
  return currentPath.startsWith(href);
}
