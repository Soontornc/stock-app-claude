# StockApp — Specification

ระบบคลังสินค้าเบิกจ่ายสำหรับใช้งานภายในองค์กร
เอกสารนี้เป็นแหล่งอ้างอิงหลัก (single source of truth) ของ requirements และแผนพัฒนา

---

## 1. ภาพรวมระบบ (System Overview)

**StockApp** คือระบบจัดการคลังสินค้าเบิกจ่าย ใช้ควบคุมการรับสินค้าเข้า–เบิกออก
มองเห็นยอดคงเหลือแบบเรียลไทม์ ป้องกันการเบิกเกินจำนวนที่มี และแจ้งเตือนสินค้าใกล้หมด

### เป้าหมาย
- บันทึกและติดตามการเคลื่อนไหวของสินค้า (รับเข้า / เบิกออก) ได้อย่างถูกต้อง
- ป้องกันการเบิกเกินยอดคงเหลือ (hard block)
- ให้ภาพรวมสต็อกและการแจ้งเตือนสินค้าใกล้หมดผ่าน Dashboard
- รองรับการแก้ไข/ลบรายการย้อนหลัง โดยยอดคงเหลือคำนวณใหม่ให้อัตโนมัติ

### ขอบเขต (Scope)
- ✅ ใช้งานภายในองค์กร — มีระบบ Auth (login / register / forgot-password / reset-password)
  ด้วย **Better Auth** และ guard ทุกหน้าด้วย proxy (Next.js 16)
- ✅ จัดการสินค้า (CRUD) พร้อม SKU, หมวดหมู่, หน่วยนับ, จุดสั่งซื้อขั้นต่ำ
- ✅ Stock In / Stock Out พร้อมกันเบิกเกิน
- ✅ Dashboard + แจ้งเตือนใกล้หมด (แสดงบนหน้าจอเท่านั้น)
- ✅ ประวัติการเคลื่อนไหว + Export CSV/Excel + กราฟแนวโน้ม
- ❌ ไม่มี roles / permissions (สิทธิ์ผู้ใช้แยกระดับ) — ทุก user ที่ login แล้วมีสิทธิ์เท่ากัน
- ❌ ไม่ต่อ integration ภายนอก (LINE / email)
- ❌ ไม่มี multi-warehouse / batch / lot / expiry

### Tech Stack
| ส่วน | เทคโนโลยี |
|------|-----------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Package Manager | pnpm |
| Mutation | Server Actions (ไม่มี REST API แยก) |
| Validation | zod (ใช้ร่วม client + server) |

---

## 2. Data Model

### Product
| Field | Type | หมายเหตุ |
|-------|------|----------|
| `id` | String (cuid) | Primary key |
| `sku` | String | **unique** |
| `name` | String | ชื่อสินค้า |
| `category` | String | หมวดหมู่ |
| `unit` | String | หน่วยนับ (ชิ้น/กล่อง/แพ็ค/ลิตร) |
| `quantity` | Int | ยอดคงเหลือปัจจุบัน |
| `reorderPoint` | Int | จุดสั่งซื้อขั้นต่ำ — ใช้แจ้งเตือนใกล้หมด |
| `price` | Decimal | ราคา/ต้นทุนต่อหน่วย |
| `createdAt` | DateTime | |
| `updatedAt` | DateTime | |

### StockTransaction
| Field | Type | หมายเหตุ |
|-------|------|----------|
| `id` | String (cuid) | Primary key |
| `productId` | String | FK → Product |
| `type` | `TransactionType` | enum `{ IN, OUT }` |
| `quantity` | Int | จำนวน > 0 เสมอ |
| `note` | String? | หมายเหตุ (optional) |
| `createdAt` | DateTime | |

### Enum
```prisma
enum TransactionType {
  IN
  OUT
}
```

### Prisma Schema (อ้างอิง)
```prisma
model Product {
  id           String            @id @default(cuid())
  sku          String            @unique
  name         String
  category     String
  unit         String
  quantity     Int               @default(0)
  reorderPoint Int               @default(0)
  price        Decimal           @default(0) @db.Decimal(12, 2)
  transactions StockTransaction[]
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
}

enum TransactionType {
  IN
  OUT
}

model StockTransaction {
  id        String          @id @default(cuid())
  productId String
  product   Product         @relation(fields: [productId], references: [id], onDelete: Cascade)
  type      TransactionType
  quantity  Int
  note      String?
  createdAt DateTime        @default(now())
}
```

> **หมายเหตุการออกแบบ:** `Product.quantity` เก็บยอดคงเหลือปัจจุบัน และถูกปรับปรุงภายใน
> `prisma.$transaction` ทุกครั้งที่มี Stock In/Out เพื่อความสอดคล้องและกันเบิกเกินแบบ atomic
> เมื่อแก้ไข/ลบ transaction ย้อนหลัง ระบบจะปรับ `quantity` ให้สอดคล้องใหม่

---

## 3. ฟีเจอร์ทั้งหมด + Acceptance Criteria

### F1 — จัดการสินค้า (Product CRUD)
- [x] สร้าง/อ่าน/แก้ไข/ลบสินค้าได้
- [x] SKU ต้องไม่ซ้ำ — ถ้าซ้ำต้องแสดง error ชัดเจน
- [x] มีหน้าตารางสินค้า ค้นหาได้ และกรองตามหมวดหมู่
- [x] แสดง badge สถานะสต็อก (ปกติ / ใกล้หมด / หมด)

**Acceptance:**
- สร้างสินค้าใหม่ด้วย SKU ที่มีอยู่แล้ว → ถูกปฏิเสธพร้อมข้อความ
- ลบสินค้า → transaction ที่เกี่ยวข้องถูกลบตาม (cascade) หรือถูกป้องกันตามนโยบาย
- ฟิลด์ที่จำเป็น (SKU, ชื่อ, หน่วย) ว่างไม่ได้

### F2 — รับสินค้าเข้า (Stock In)
- [x] ฟอร์มเลือกสินค้า + จำนวน + หมายเหตุ
- [x] บันทึก StockTransaction type=IN และเพิ่ม `quantity` ของสินค้า
- [x] แสดงรายการรับล่าสุด

**Acceptance:**
- รับเข้า 10 หน่วย → `quantity` เพิ่มขึ้น 10 ทันที
- จำนวนต้อง > 0

### F3 — เบิกสินค้าออก (Stock Out) + กันเบิกเกิน
- [x] ฟอร์มเลือกสินค้า + จำนวน + หมายเหตุ
- [x] ตรวจสอบ `quantity >= จำนวนที่เบิก` **ภายใน `prisma.$transaction`**
- [x] ถ้าเบิกเกิน → บล็อก พร้อม error ชัดเจน (hard block)
- [x] บันทึก type=OUT และลด `quantity`

**Acceptance:**
- เบิกน้อยกว่า/เท่ายอดคงเหลือ → สำเร็จ, `quantity` ลดลงถูกต้อง
- เบิกเกินยอดคงเหลือ → ถูกปฏิเสธ, `quantity` ไม่เปลี่ยน
- การเบิกพร้อมกันสองรายการ (race) → ยอดรวมไม่ติดลบ

### F4 — Dashboard + แจ้งเตือนใกล้หมด
- [x] การ์ดสรุป: จำนวน SKU, รวมชิ้น, จำนวนสินค้าใกล้หมด, จำนวนสินค้าหมด
- [x] ตารางสินค้าใกล้หมด (`quantity <= reorderPoint`) และหมด (`quantity <= 0`)
- [x] กราฟแนวโน้มการเคลื่อนไหว IN/OUT

**Acceptance:**
- สินค้าที่ `quantity <= reorderPoint` แสดงในรายการ "ใกล้หมด"
- ตัวเลขบนการ์ดตรงกับข้อมูลจริง

### F5 — ประวัติการเคลื่อนไหว + แก้ไข/ลบ + Export
- [x] หน้าประวัติรวม IN/OUT กรองตามวันที่/สินค้า/ประเภท
- [x] แก้ไข/ลบ transaction ได้ → ปรับ `quantity` ใหม่ให้สอดคล้อง
- [x] แก้ไขรายการ OUT (เพิ่มจำนวน) ต้อง re-validate กันเบิกเกิน
- [x] Export CSV (UTF-8 BOM ให้ Excel อ่านไทยได้)

**Acceptance:**
- แก้จำนวน transaction → ยอดคงเหลือคำนวณใหม่ถูกต้อง
- ลบ transaction → ยอดคงเหลือย้อนกลับตามที่ควรเป็น
- เปิดไฟล์ CSV ใน Excel เห็นภาษาไทยถูกต้อง

---

## 4. แผนการพัฒนา (5 Phases)

### Phase 1 — Foundation (วันที่ 1)
ตั้งรากฐานโปรเจกต์และฐานข้อมูลให้พร้อมใช้งาน

- [x] ตั้งโปรเจกต์ Next.js 16 (App Router) + TypeScript ด้วย pnpm
- [x] ติดตั้ง + ตั้งค่า Tailwind CSS v4 และ shadcn/ui
- [x] ติดตั้ง Prisma และเขียน schema: `Product`, `StockTransaction`, `enum TransactionType{IN,OUT}`
- [x] เชื่อมต่อ PostgreSQL (`.env` → `DATABASE_URL`)
- [x] รัน migration ครั้งแรก (`prisma migrate dev`)
- [x] เขียน seed script ข้อมูลตัวอย่าง **SKU-1001 ถึง SKU-1007**
- [x] วาง `CLAUDE.md` เป็น "สมองของโปรเจกต์" (สถาปัตยกรรม, คำสั่ง, ข้อตกลง)

### Phase 2 — Core Features (วันที่ 2)
สร้างฟีเจอร์หลักให้ใช้งานได้ครบวงจร

- [x] CRUD สินค้าครบวงจร (Create / Read / Update / Delete) ด้วย Server Actions + zod
- [x] หน้าตารางสินค้า: ค้นหา + กรองหมวดหมู่ + badge สถานะ
- [x] Stock In: ฟอร์ม + บันทึก transaction + เพิ่ม quantity
- [x] Stock Out: กันเบิกเกินด้วย `prisma.$transaction` (เช็ก + ปรับยอด atomic)
- [x] Dashboard: การ์ดสรุป + ตารางสินค้าใกล้หมด + กราฟแนวโน้ม
- [x] Custom Slash Commands สำหรับงานที่ทำบ่อย (เช่น seed, migrate, add-product)
- [x] ระบบ Auth (Better Auth): login / register / forgot-password / reset-password
      + guard ทุกหน้าด้วย proxy (Next.js 16)

### Phase 3 — Agentic Quality (วันที่ 3)
ยกระดับคุณภาพด้วย agentic workflow

- [ ] Sub-agents: `code-reviewer`, `test-writer`, `security-auditor` (`.claude/agents/`)
- [ ] MCP integration: **PostgreSQL MCP** (query ตรวจข้อมูล) + **GitHub MCP** (PR/issue)
- [ ] Hooks: lint / format / test อัตโนมัติหลังแก้ไขโค้ด (`.claude/settings.json`)

### Phase 4 — Team & Containerization (วันที่ 4)
เตรียมทำงานเป็นทีมและ containerize

- [ ] แชร์ `.claude/` config ผ่าน Git ให้ทีมใช้ร่วมกัน
- [ ] Git workflow: commit message convention + PR template + code review flow
- [ ] Dockerfile multi-stage build (Next.js `output: 'standalone'`)
- [ ] Docker Compose (บริการ `app` + `postgres`)
- [ ] CI ด้วย GitHub Actions: build + push image ไป `ghcr.io`

### Phase 5 — Production (วันที่ 5)
Deploy ขึ้น production พร้อมความปลอดภัยและ monitoring

- [ ] Deploy บน VPS Ubuntu: SSH hardening + UFW firewall
- [ ] Nginx reverse proxy + HTTPS ด้วย Let's Encrypt (certbot)
- [ ] CD อัตโนมัติ: pull image ใหม่ + zero-downtime restart
- [ ] Backup / Rollback strategy (dump ฐานข้อมูล + tag image)
- [ ] Monitoring: health check endpoint + alert

---

## ภาคผนวก — โครงหน้าจอ (App Router)

| Route | หน้าที่ |
|-------|---------|
| `/` | Dashboard — การ์ดสรุป + สินค้าใกล้หมด + กราฟ |
| `/products` | ตารางสินค้า + ค้นหา + กรองหมวดหมู่ |
| `/products/new` | ฟอร์มเพิ่มสินค้า |
| `/products/[id]/edit` | ฟอร์มแก้ไขสินค้า |
| `/stock-in` | ฟอร์มรับเข้า + รายการล่าสุด |
| `/stock-out` | ฟอร์มเบิกออก + รายการล่าสุด (กันเบิกเกิน) |
| `/transactions` | ประวัติรวม + แก้ไข/ลบ + Export CSV |
| `/login` | เข้าสู่ระบบ (Better Auth) |
| `/register` | สมัครสมาชิก (Better Auth) |
| `/forgot-password` | ขอลิงก์รีเซ็ตรหัสผ่าน (Better Auth) |
| `/reset-password` | ตั้งรหัสผ่านใหม่จากลิงก์รีเซ็ต (Better Auth) |
