---
description: Reset the database and reseed sample products (SKU-1001..1007)
---

Run `pnpm db:seed` in the project root and report the output. If it fails,
check that `docker compose up -d` has been run and `.env` has the correct
`DATABASE_URL` before retrying.
