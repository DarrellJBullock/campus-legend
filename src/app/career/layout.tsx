import { CareerShell } from "@/components/game/career-shell";
import { StoryEventDialog } from "@/components/game/story-event-dialog";

export default function CareerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CareerShell>
      {children}
      <StoryEventDialog />
    </CareerShell>
  );
}
