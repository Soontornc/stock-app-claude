---
description: Scaffold a new product end-to-end (schema check, seed entry, or quick DB insert)
argument-hint: <sku> <name> <category> <unit> <quantity> <reorderPoint> <price>
---

The user wants to add a product quickly: "$ARGUMENTS" (sku, name, category,
unit, quantity, reorderPoint, price — ask for any missing fields).

Prefer using the running app: open `/products/new` and fill in the form, or
if given the running dev server, call the `createProduct` server action path
via the UI. Only fall back to inserting directly with `prisma.product.create`
in a one-off script if the user explicitly asks to skip the UI.

After adding, verify with `pnpm db:studio` or a quick `SELECT` that the SKU
is unique and `quantity`/`reorderPoint` are non-negative integers, matching
the F1 acceptance criteria in `docs/spec.md`.
