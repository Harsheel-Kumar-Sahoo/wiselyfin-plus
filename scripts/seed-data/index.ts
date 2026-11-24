import { beginner } from "./beginner.js";
import { investing } from "./investing.js";
import { scamAwareness } from "./scam-awareness.js";
import { taxesSavings } from "./taxes-savings.js";
import type { SeedPath } from "./types.js";

export const allPaths: SeedPath[] = [beginner, investing, taxesSavings, scamAwareness];