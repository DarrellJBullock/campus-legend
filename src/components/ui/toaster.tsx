"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToastStore } from "./use-toast";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      className="pointer-events-none fixed bottom-0 right-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex animate-count-up items-start gap-3 rounded-lg border p-4 shadow-lg",
            t.variant === "success" && "border-turf/40 bg-turf/15",
            t.variant === "destructive" &&
              "border-destructive/40 bg-destructive/15",
            (!t.variant || t.variant === "default") && "border-border bg-card",
          )}
        >
          <div className="flex-1">
            <p className="font-display text-sm font-semibold uppercase tracking-wide">
              {t.title}
            </p>
            {t.description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {t.description}
              </p>
            ) : null}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            className="focus-ring rounded-sm opacity-60 hover:opacity-100"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
