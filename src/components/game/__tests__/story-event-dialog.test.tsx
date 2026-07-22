import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StoryEventDialog } from "@/components/game/story-event-dialog";
import { useCareerStore } from "@/stores/career-store";
import { createTestCareer } from "@/test/fixtures";
import { STORY_EVENTS } from "@/content/events";

describe("StoryEventDialog", () => {
  beforeEach(() => {
    useCareerStore.getState().load(createTestCareer());
  });

  it("renders nothing when there is no active event", () => {
    render(<StoryEventDialog />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the event title, description, and one button per choice", () => {
    const event = STORY_EVENTS[0]!;
    useCareerStore.setState({ activeEvent: event });
    render(<StoryEventDialog />);

    expect(screen.getByText(event.title)).toBeInTheDocument();
    expect(screen.getByText(event.description)).toBeInTheDocument();
    for (const choice of event.choices) {
      expect(
        screen.getByRole("button", { name: new RegExp(choice.label) }),
      ).toBeInTheDocument();
    }
  });

  it("closes the dialog after a choice is clicked", async () => {
    const event = STORY_EVENTS[0]!;
    useCareerStore.setState({ activeEvent: event });
    const user = userEvent.setup();
    render(<StoryEventDialog />);

    const firstChoice = event.choices[0]!;
    await user.click(
      screen.getByRole("button", { name: new RegExp(firstChoice.label) }),
    );

    expect(useCareerStore.getState().activeEvent).toBeNull();
    expect(screen.queryByText(event.title)).not.toBeInTheDocument();
  });
});
