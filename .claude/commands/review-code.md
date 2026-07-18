---
description: Review a file against StockApp conventions — correctness, style, error handling, performance, security
argument-hint: <file-path (reference it with @)>
---

Review the file given in "$ARGUMENTS" (invoked like `/review-code @app/stock-out/actions.ts`
— the `@` reference loads the file into context automatically). If no path was
given, ask which file to review before doing anything else.

Also read @CLAUDE.md and @prisma/schema.prisma for context — conventions and
the data model the file is expected to follow.

Check these five categories:

### 1. Correctness

- Business logic matches the acceptance criteria in `docs/spec.md` (e.g. F3's
  atomic over-withdrawal guard, F5's quantity recompute on edit/delete)
- Edge cases: zero/negative quantities, missing relations, concurrent stock
  mutations (race conditions)
- Comparison operators on stock checks (`>` vs `>=`) match the intended rule

### 2. Convention (project-specific — see CLAUDE.md)

- **No semicolons** — flag any `;` that isn't inside a string or regex literal
- Server Actions not bound to a form return `ActionResult<T>`
  (`{ success: true, data } | { success: false, error }`); form actions driven
  by `useActionState` keep the existing `{ errors?, message? }` shape instead —
  don't flag those for using it
- **`deletedAt` filter** — if the model being queried has a `deletedAt` field
  (soft-delete), every `findMany`/`findFirst`/`findUnique` must filter
  `deletedAt: null`, and removal must set `deletedAt: new Date()` instead of
  calling `prisma.<model>.delete(...)`. No model in the current schema has
  `deletedAt` yet, so this only applies if the file being reviewed introduces
  one — otherwise skip this check rather than force it in
- zod validation shared between client/server, not duplicated inline
- Prisma 7 rules: no `url` in `datasource`, client imported from
  `lib/generated/prisma/client`, driver adapter used correctly
- shadcn `Button` has no `asChild` — links styled as buttons must use
  `buttonVariants()` + `Link`, not `<Button asChild>`

### 3. Error Handling

- Expected failures (duplicate SKU, insufficient stock, validation errors)
  return structured results instead of throwing uncaught
- Unexpected errors don't leak raw Prisma/DB error messages to the UI
- Mutations touching `Product.quantity` roll back correctly on failure — rely
  on `prisma.$transaction`, not partial writes

### 4. Performance

- No N+1 queries (missing `include`/`select`, or querying inside a loop)
- `select`/`include` scoped to only the fields actually used downstream
- No redundant `revalidatePath` calls or duplicate Prisma calls in one action

### 5. Security

- No secrets or connection strings hardcoded
- User input passed through zod before reaching Prisma — no raw string
  interpolation into queries
- Update/delete actions don't trust a client-supplied `id` blindly — the row
  is scoped/verified, not just fetched and mutated by id alone
- Auth-gated behavior actually relies on `proxy.ts` / session checks, not
  just hiding UI elements client-side

## Output format

Prefix every finding with one of:

- ✅ ดีแล้ว — worth confirming only when non-obvious (don't restate every line
  that's simply fine)
- ⚠️ ควรปรับ — style/convention/minor issues, safe but not ideal
- ❌ ต้องแก้ด่วน — correctness/security/error-handling bugs to fix before merge

Group findings under the five category headings above. If a category has
nothing to flag, write "✅ ไม่มีปัญหา" for that category instead of listing
lines that are merely fine.
