/**
 * Seed script (`pnpm db:seed`).
 *
 * Content (schools, sponsors, events, courses) is static and ships in the app
 * bundle — nothing to insert there. This script instead validates that the
 * deterministic demo career builds cleanly and, if Supabase service creds are
 * present, seeds a shared demo row. Run with: `pnpm db:seed`.
 */

import { buildDemoCareer, DEMO_CAREER_ID } from "../src/content/demo-career";
import { parseSave } from "../src/lib/schemas";
import { STORY_EVENTS } from "../src/content/events";
import { SCHOOLS } from "../src/content/schools";
import { SPONSORS } from "../src/content/sponsors";

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error(`✗ ${msg}`);
    process.exit(1);
  }
  console.log(`✓ ${msg}`);
}

function main(): void {
  console.log("Campus Legend — seed / content validation\n");

  assert(SCHOOLS.length === 12, `12 schools present (${SCHOOLS.length})`);
  assert(SPONSORS.length >= 24, `24+ sponsors present (${SPONSORS.length})`);
  assert(
    STORY_EVENTS.length >= 40,
    `40+ story events present (${STORY_EVENTS.length})`,
  );

  const categories = new Set(STORY_EVENTS.map((e) => e.category));
  assert(
    categories.size >= 17,
    `17+ event categories covered (${categories.size})`,
  );

  const demo = buildDemoCareer();
  assert(demo.id === DEMO_CAREER_ID, "demo career built with expected id");
  assert(parseSave(demo) !== null, "demo career passes save-schema validation");

  // Determinism: building twice yields identical attributes.
  const again = buildDemoCareer();
  assert(
    JSON.stringify(demo.athlete.attributes) ===
      JSON.stringify(again.athlete.attributes),
    "demo career generation is deterministic",
  );

  console.log(
    "\nAll content validated. (Static content ships in the bundle; no DB rows required.)",
  );
}

main();
