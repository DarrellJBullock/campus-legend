"use client";

import { useCareerStore } from "@/stores/career-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/** Global story-event modal. Renders whenever the store has an active event. */
export function StoryEventDialog() {
  const event = useCareerStore((s) => s.activeEvent);
  const resolveEvent = useCareerStore((s) => s.resolveEvent);
  const dismissEvent = useCareerStore((s) => s.dismissEvent);

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && dismissEvent()}>
      <DialogContent
        className="max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {event ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {event.title}
              </DialogTitle>
              <DialogDescription>{event.description}</DialogDescription>
            </DialogHeader>
            <div className="mt-2 space-y-2" role="group" aria-label="Choices">
              {event.choices.map((choice) => (
                <Button
                  key={choice.id}
                  variant="outline"
                  className="h-auto w-full flex-col items-start gap-1 whitespace-normal p-3 text-left"
                  onClick={() => resolveEvent(choice)}
                >
                  <span className="font-semibold">{choice.label}</span>
                  {choice.description ? (
                    <span className="text-xs font-normal text-muted-foreground">
                      {choice.description}
                    </span>
                  ) : null}
                </Button>
              ))}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
