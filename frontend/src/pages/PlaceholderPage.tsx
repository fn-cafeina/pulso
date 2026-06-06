import { type LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function PlaceholderPage({ icon: Icon, title, description }: Props) {
  return (
    <div className="py-4 md:py-6 px-4 md:px-8 flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in-up">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-xl mb-6 animate-float">
        <Icon size={40} />
      </div>
      <h2 className="text-2xl font-bold text-text mb-2">{title}</h2>
      <p className="text-gray max-w-md">{description}</p>
      <div className="mt-6 px-4 py-2 bg-info/10 text-info rounded-button text-sm font-medium">
        Próximamente
      </div>
    </div>
  );
}
