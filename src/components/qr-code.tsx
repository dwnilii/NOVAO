import { cn } from "@/lib/utils";

export function QrCodePlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("w-full h-full", className)}
      fill="currentColor"
      shapeRendering="crispEdges"
    >
      <rect width="100" height="100" fill="white" />
      <rect width="30" height="30" />
      <rect x="70" width="30" height="30" />
      <rect y="70" width="30" height="30" />
      <rect x="10" y="10" width="10" height="10" fill="white" />
      <rect x="80" y="10" width="10" height="10" fill="white" />
      <rect x="10" y="80" width="10" height="10" fill="white" />

      <rect x="40" y="10" width="10" height="10" />
      <rect x="60" y="20" width="10" height="10" />
      <rect x="40" y="30" width="10" height="10" />
      <rect x="20" y="40" width="10" height="10" />
      <rect x="40" y="40" width="30" height="30" />
      <rect x="50" y="50" width="10" height="10" fill="white" />

      <rect x="80" y="40" width="10" height="10" />
      <rect x="40" y="80" width="10" height="10" />
      <rect x="60" y="80" width="10" height="10" fill="hsl(var(--primary))" />
      <rect x="80" y="80" width="10" height="10" />
      <rect x="80" y="60" width="10" height="10" fill="hsl(var(--primary))" />
    </svg>
  );
}
