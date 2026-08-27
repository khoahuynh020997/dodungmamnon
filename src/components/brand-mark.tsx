import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 grid-cols-2 gap-0.5 rounded-md bg-primary p-1.5",
        className,
      )}
      aria-hidden
    >
      <span className="rounded-xs bg-primary-fg" />
      <span className="rounded-xs bg-primary-fg/40" />
      <span className="rounded-xs bg-primary-fg/40" />
      <span className="rounded-xs bg-primary-fg" />
    </span>
  );
}
