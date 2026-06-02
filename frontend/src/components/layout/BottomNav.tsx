import { bottomItems, isActive } from "./navConfig";

interface Props {
  currentPath: string;
}

export default function BottomNav({ currentPath }: Props) {
  return (
    <nav className="flex items-center justify-around h-16" aria-label="Navegación principal">
      {bottomItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(currentPath, item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 min-w-[60px] py-2 transition-colors ${
              active ? "text-primary" : "text-gray"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
