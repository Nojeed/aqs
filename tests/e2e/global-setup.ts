import { rm } from "node:fs/promises";

/** Start every run from the seed content: the site recreates missing data files from seed/. */
export default async function globalSetup() {
  await rm(".e2e-data", { recursive: true, force: true });
}
