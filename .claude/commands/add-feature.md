---
description: Plan a new feature end-to-end — analyze impacted models against schema/spec, propose a checklist, wait for confirmation before implementing
argument-hint: <feature-name>
---

The user wants to add a new feature: "$ARGUMENTS" (ask what it is if not given).

## 1. Analyze first — do not write code yet

Read these three files before proposing anything:

- @prisma/schema.prisma — current data model (`Product`, `StockTransaction`, plus
  `User`/`Session`/`Account`/`Verification` from Better Auth)
- @CLAUDE.md — architecture, conventions, Prisma 7 gotchas
- @docs/spec.md — requirements, scope (ขอบเขต), acceptance criteria, and the
  5-phase plan (single source of truth)

From these, work out:

- Which existing model(s) the feature touches, if any
- Whether it needs a new model, a new field, or a new migration
- Whether it fits inside the declared scope in spec.md's `ขอบเขต` section — if
  the feature falls under something explicitly marked ❌ (e.g. roles/permissions,
  external integrations, multi-warehouse/batch/lot), say so plainly and confirm
  with the user that they want to expand scope before continuing
- Which route(s) and Server Action(s) it needs
- What can be reused instead of written from scratch — check `components/`,
  `lib/validations/`, and existing action files for a similar pattern first

## 2. Present a plan, then stop

Output a checklist-style plan covering:

- [ ] Schema changes (model / field / migration), if any
- [ ] zod validation schema (`lib/validations/*.ts`)
- [ ] Server Action(s) and their result shape
- [ ] Route(s)/page(s), and which existing UI components get reused
- [ ] Sidebar nav entry, if the feature is user-facing
- [ ] `docs/spec.md` updates needed (new F-number + acceptance criteria, route
      table, phase checklist)

**Do not implement anything yet.** Wait for the user to confirm the plan, or
adjust it if they push back, before writing any code.

## 3. Rules for implementation (once the plan is confirmed)

- **No semicolons** anywhere in TS/JS — run `pnpm format` before finishing.
- **TypeScript strict** — no `any`, no unchecked casts; let Prisma's generated
  types flow through instead of re-declaring them.
- **Server Actions return `ActionResult<T>`** for actions not bound to a form:
  ```ts
  type ActionResult<T = void> =
    | { success: true; data: T }
    | { success: false; error: string }
  ```
  Form actions driven by `useActionState` keep the existing `{ errors?, message? }`
  shape already used across `app/*/actions.ts` (see `ProductFormState` in
  `app/products/actions.ts`) — don't force those into `ActionResult`. If
  `ActionResult` isn't defined anywhere yet (it currently isn't), add it once,
  in a shared location (e.g. `lib/types.ts`), rather than redeclaring it per file.
- Validate with zod, shared between client and server — see `lib/validations/`
  for the existing pattern.
- Any mutation touching `Product.quantity` must stay inside `prisma.$transaction`
  with an atomic conditional update (`updateMany` + `gte` check), per F3 —
  never read-then-write, even for a "harmless" quantity bump.

## 4. After implementing

Remind the user (and yourself) to update `docs/spec.md`:

- Add or update the feature under section 3 (ฟีเจอร์ทั้งหมด + Acceptance Criteria)
  with an F-number and concrete acceptance criteria
- Update the route table in the appendix if new routes were added
- Check off the relevant Phase checklist item, or add a new one if this wasn't
  already planned
