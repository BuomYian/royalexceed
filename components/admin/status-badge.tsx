import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  // Publish status
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-success/15 text-success border-success/30",
  ARCHIVED: "bg-muted text-muted-foreground",
  // Stock status
  IN_TRANSIT: "bg-warning/15 text-warning border-warning/30",
  AVAILABLE: "bg-success/15 text-success border-success/30",
  RESERVED: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
  SOLD: "bg-muted text-muted-foreground",
  // Lead status
  NEW: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
  CONTACTED: "bg-warning/15 text-warning border-warning/30",
  QUALIFIED: "bg-purple-500/15 text-purple-600 border-purple-500/30 dark:text-purple-400",
  NEGOTIATION: "bg-orange-500/15 text-orange-600 border-orange-500/30 dark:text-orange-400",
  WON: "bg-success/15 text-success border-success/30",
  LOST: "bg-destructive/15 text-destructive border-destructive/30",
  // Booking status
  PENDING: "bg-warning/15 text-warning border-warning/30",
  CONFIRMED: "bg-success/15 text-success border-success/30",
  RESCHEDULED: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
  COMPLETED: "bg-success/15 text-success border-success/30",
  CANCELLED: "bg-muted text-muted-foreground",
  NO_SHOW: "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_STYLES[status])}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}
