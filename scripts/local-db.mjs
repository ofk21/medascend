#!/usr/bin/env node
/**
 * Zero-install local PostgreSQL for development (no Docker needed).
 *
 *   npm i -D embedded-postgres      # one-off (downloads PostgreSQL binaries for your OS)
 *   npm run db:local                # starts Postgres on 127.0.0.1:5544, data in ./.pgdata
 *
 * Then set in .env:
 *   DATABASE_URL="postgresql://medascend:medascend@127.0.0.1:5544/medascend?schema=public"
 * and run `npm run db:deploy && npm run db:seed`.
 */
import fs from "node:fs";

let EmbeddedPostgres;
try {
  ({ default: EmbeddedPostgres } = await import("embedded-postgres"));
} catch {
  console.error("embedded-postgres is not installed. Run:  npm i -D embedded-postgres");
  process.exit(1);
}

const dataDir = "./.pgdata";
const port = Number(process.env.LOCAL_PG_PORT ?? 5544);
const fresh = !fs.existsSync(dataDir);
const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "medascend",
  password: "medascend",
  port,
  persistent: true,
  // UTF-8 so emoji and non-Latin content work regardless of the OS locale
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
});

if (fresh) await pg.initialise();
await pg.start();
if (fresh) await pg.createDatabase("medascend");

console.log(`\n✔ Local PostgreSQL running.\n  DATABASE_URL="postgresql://medascend:medascend@127.0.0.1:${port}/medascend?schema=public"\n  Press Ctrl+C to stop.\n`);

const stop = async () => {
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
