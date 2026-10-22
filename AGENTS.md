<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Supabase database migrations

The owner shared a Supabase notice on October 21, 2026: starting October 30, 2026, existing projects will no longer automatically grant Data API access to new tables in the `public` schema. Existing tables retain their grants. Schema recreation, new projects, preview branches, and local `supabase db reset` also need explicit grants.

- Include explicit grants in the same migration that creates each API-accessible table. Do not rely on project default privileges.
- Grant only the operations each role needs (`anon`, `authenticated`, and `service_role` where applicable). Do not copy broad CRUD grants onto private tables. For example, the LIVE queue grants authenticated administrators access through RLS and exposes public intake through a restricted RPC, not anonymous table access.
- Treat SQL grants and row-level security as separate requirements: configure both and test anonymous, authenticated non-admin, and admin behavior.
- For functions, explicitly configure EXECUTE privileges as appropriate. For table recreation, restore the intended grants and policies in that migration.
- Validate migrations from a fresh database as well as against existing schemas when relevant, so resets and preview environments do not depend on old grants.
