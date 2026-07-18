---
description: Create and apply a new Prisma migration for schema.prisma changes
argument-hint: <migration-name>
---

The user wants to create a Prisma migration named "$ARGUMENTS" (ask for a
name if not given). Steps:

1. Confirm `prisma/schema.prisma` has the intended changes already saved.
2. Run `pnpm db:migrate --name $ARGUMENTS` (this also runs `prisma generate`).
3. Report the generated migration file path and summarize what changed.

Remember Prisma 7 conventions from CLAUDE.md: no `url` in the `datasource`
block, connection string lives in `prisma.config.ts`, client output goes to
`lib/generated/prisma`.
