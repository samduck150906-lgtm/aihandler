import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-ink-faint/30 dark:bg-ink-muted/20", className)}
      {...props}
    />
  );
}

export { Skeleton };
