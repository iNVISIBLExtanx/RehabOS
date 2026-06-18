"use client";

import { PGlite } from "@electric-sql/pglite";

// Singleton in-browser pglite instance — schema + seed loaded once on first access.
// Only used in DB Explorer components (client-side only, no backend needed).
let instance: PGlite | null = null;
let ready: Promise<PGlite> | null = null;

export function getPglite(): Promise<PGlite> {
  if (ready) return ready;

  ready = (async () => {
    const db = new PGlite();

    // Fetch the seed SQL that mirrors the Supabase migrations
    const res = await fetch("/pglite-seed.sql");
    const sql = await res.text();
    await db.exec(sql);

    instance = db;
    return db;
  })();

  return ready;
}

export { instance };
