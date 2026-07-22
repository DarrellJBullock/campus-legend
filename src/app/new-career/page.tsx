import type { Metadata } from "next";
import { NewCareerWizard } from "@/components/onboarding/new-career-wizard";

export const metadata: Metadata = { title: "New Career — Campus Legend" };

export default function NewCareerPage() {
  return (
    <main id="main-content">
      <NewCareerWizard />
    </main>
  );
}
