// src/components/LogItem.jsx
import { Badge } from "@/components/ui/badge";

export default function LogItem({ log }) {
  let level = "INFO";
  if (log.includes("ERROR")) level = "ERROR";
  else if (log.includes("WARN")) level = "WARN";

  const variant =
    level === "ERROR" ? "destructive" :
    level === "WARN" ? "warning" :
    "secondary";

  return (
    <div className="flex items-start gap-2 bg-muted/30 hover:bg-muted/50 transition-colors p-2 rounded-xl text-sm font-mono leading-snug shadow-sm border border-muted-foreground/10 mb-5">
      <Badge variant={variant} className="mt-1">
        {level}
      </Badge>
      <span className="text-foreground/90 break-words">{log}</span>
    </div>
  );
}
