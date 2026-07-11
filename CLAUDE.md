# CLAUDE.md — StockApp

สมองของโปรเจกต์สำหรับ Claude Code และทีม อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง
requirements ฉบับเต็มอยู่ที่ `docs/spec.md` (single source of truth)

## ภาพรวม

StockApp = ระบบคลังสินค้าเบิกจ่ายภายในองค์กร (ไม่มี login) — รับเข้า/เบิกออก,
ยอดคงเหลือเรียลไทม์, กันเบิกเกินแบบ atomic, Dashboard + แจ้งเตือนใกล้หมด,
ประวัติ + แก้ไข/ลบย้อนหลัง + Export CSV

## Tech Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **PostgreSQL** (รันผ่าน `docker-compose.yml`)
- **Prisma 7** (ORM) + driver adapter `@prisma/adapter-pg`
- **Tailwind CSS v4** + **shadcn/ui** (base-ui)
- **pnpm** เป็น package manager
- **Server Actions** สำหรับ mutation (ไม่มี REST API แยก)
- **zod** สำหรับ validation (ใช้ร่วม client + server)

## คำสั่งที่ใช้บ่อย

```bash
# Database (Docker)
docker compose up -d          # สตาร์ท Postgres (service: postgres, port 5432)
docker compose down           # หยุด (คงข้อมูลใน volume)
docker compose down -v        # หยุด + ลบข้อมูลทั้งหมด

# Prisma
pnpm db:migrate               # prisma migrate dev (สร้าง/ใช้ migration + generate)
pnpm db:seed                  # seed ข้อมูลตัวอย่าง SKU-1001..1007
pnpm db:studio                # เปิด Prisma Studio
pnpm exec prisma generate     # generate client อย่างเดียว

# Dev / Build
pnpm dev                      # dev server
pnpm build                    # production build (รัน TypeScript typecheck ด้วย)
pnpm lint                     # eslint (Next.js 16 ใช้ eslint ตรง ไม่ใช่ next lint)
pnpm format                   # prettier --write .
pnpm format:check             # prettier --check .
```

## ข้อตกลงการเขียนโค้ด (Conventions)

- **ห้ามใส่ semicolon** ใน TS/JS ทุกไฟล์ — บังคับด้วย Prettier (`.prettierrc.json`, `semi: false`)
  รัน`pnpm format` ก่อน commit เสมอ
- ใช้ **single quote** + **trailing comma** (ตั้งไว้ใน Prettier แล้ว)
- Mutation ทั้งหมดผ่าน **Server Actions** + validate ด้วย **zod** (schema แชร์ client/server)
- **Stock Out ต้องกันเบิกเกินภายใน `prisma.$transaction`** — เช็ก `quantity >= จำนวนที่เบิก`
  แล้วปรับยอดใน transaction เดียวกัน (atomic, กัน race condition) ดู F3 ใน spec
- แก้ไข/ลบ transaction ย้อนหลังต้องคำนวณ `Product.quantity` ใหม่ให้สอดคล้อง
- **shadcn `Button` เป็น base-ui — ไม่มี prop `asChild`** ถ้าอยากได้ลิงก์หน้าตาปุ่ม
  ให้ใช้ `<Link className={buttonVariants({ variant, size })}>` (หรือ base-ui `render` prop)
  ไม่ใช่ `<Button asChild>`
- ฟอร์มใช้ Server Action + `useActionState` (React 19) แสดง error จาก zod แบบ inline

## โครงสร้างโปรเจกต์

```
app/                     App Router (routes + layout)
components/ui/           shadcn/ui components
lib/
  prisma.ts              Prisma client singleton (+ pg adapter)
  utils.ts               shadcn cn() helper
  generated/prisma/      Prisma client ที่ generate (gitignored)
prisma/
  schema.prisma          data model
  migrations/            migration history
  seed.ts                seed script
prisma.config.ts         Prisma 7 config (datasource url + seed command)
docker-compose.yml       Postgres
docs/spec.md             requirements ฉบับเต็ม
```

## Data Model (สรุป)

- **Product**: `id, sku (unique), name, category, unit, quantity, reorderPoint, price (Decimal), createdAt, updatedAt`
- **StockTransaction**: `id, productId (FK, cascade), type (IN|OUT), quantity (>0), note?, createdAt`
- **enum TransactionType** = `{ IN, OUT }`
- `Product.quantity` = ยอดคงเหลือปัจจุบัน ปรับภายใน `prisma.$transaction` ทุกครั้งที่มีการเคลื่อนไหว

สถานะสต็อก: `quantity <= 0` = หมด, `quantity <= reorderPoint` = ใกล้หมด, นอกนั้น = ปกติ

## Routes (เป้าหมาย)

| Route                                               | หน้าที่                         |
| --------------------------------------------------- | ------------------------------- |
| `/`                                                 | Dashboard                       |
| `/products`, `/products/new`, `/products/[id]/edit` | จัดการสินค้า                    |
| `/stock-in`, `/stock-out`                           | รับเข้า / เบิกออก (กันเบิกเกิน) |
| `/transactions`                                     | ประวัติ + แก้ไข/ลบ + Export CSV |

## ⚠️ Prisma 7 — ข้อควรระวัง (ต่างจาก Prisma 6 / ตัวอย่างเก่า)

Prisma 7 มี breaking changes สำคัญที่ต้องรู้ ไม่งั้นจะงง:

1. **`datasource` ใน `schema.prisma` ห้ามมี `url`** — ย้าย connection URL ไปที่ `prisma.config.ts`
   (`datasource.url = env('DATABASE_URL')`) `prisma.config.ts` โหลด `.env` เองผ่าน `dotenv`
   (Prisma 7 ไม่โหลด `.env` อัตโนมัติแล้ว)
2. **PrismaClient ต้องรับ driver adapter** — สร้างผ่าน `new PrismaClient({ adapter })`
   โดย adapter คือ `new PrismaPg({ connectionString: process.env.DATABASE_URL })` (ดู `lib/prisma.ts`)
3. **generator ต้องระบุ `output`** — client generate ไปที่ `lib/generated/prisma`
   import จาก `./generated/prisma/client` (ไม่ใช่ `@prisma/client`)
4. seed command ตั้งใน `prisma.config.ts` (`migrations.seed`) ไม่ใช่ใน `package.json > prisma`

## Environment

- `.env` (gitignored) — คัดลอกจาก `.env.example`
- `DATABASE_URL="postgresql://stockuser:stockpass@localhost:5432/stockdb?schema=public"`
  ตรงกับ credentials ใน `docker-compose.yml` (user `stockuser`, db `stockdb`)
