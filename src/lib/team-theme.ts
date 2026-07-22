/**
 * Team theming — inject a school's fictional colors into the --team-* CSS
 * variables so nameplates, trading cards, and accents pick them up. Returns a
 * style object to spread onto a wrapping element.
 */

import type { CSSProperties } from "react";
import { getSchool } from "@/content/schools";

export function teamStyle(schoolId: string): CSSProperties {
  const school = getSchool(schoolId);
  const primary = school?.primaryColor ?? "222 47% 20%";
  const secondary = school?.secondaryColor ?? "45 93% 55%";
  return {
    ["--team-primary" as string]: primary,
    ["--team-secondary" as string]: secondary,
  } as CSSProperties;
}
