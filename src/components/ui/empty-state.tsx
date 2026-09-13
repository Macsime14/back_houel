import Link from "next/link";
import { Plus, type LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string; icon?: LucideIcon };
};

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const ActionIcon = action?.icon ?? Plus;

  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className={cn(buttonVariants({ size: "sm" }), "mt-1")}>
          <ActionIcon /> {action.label}
        </Link>
      )}
    </div>
  );
}
