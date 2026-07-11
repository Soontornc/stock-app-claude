import 'dotenv/config'
import { prisma } from '../lib/prisma'

type SeedProduct = {
  sku: string
  name: string
  category: string
  unit: string
  quantity: number
  reorderPoint: number
  price: string
}

// ตัวอย่างข้อมูล SKU-1001 ถึง SKU-1007
// จงใจให้มีทั้งของปกติ / ใกล้หมด (quantity <= reorderPoint) / หมด (quantity <= 0)
// เพื่อทดสอบ badge สถานะและ Dashboard
const products: SeedProduct[] = [
  {
    sku: 'SKU-1001',
    name: 'ปากกาลูกลื่น สีน้ำเงิน',
    category: 'เครื่องเขียน',
    unit: 'ชิ้น',
    quantity: 500,
    reorderPoint: 100,
    price: '5.00',
  },
  {
    sku: 'SKU-1002',
    name: 'สมุดโน้ต A5',
    category: 'เครื่องเขียน',
    unit: 'เล่ม',
    quantity: 80,
    reorderPoint: 100,
    price: '25.00',
  },
  {
    sku: 'SKU-1003',
    name: 'กระดาษถ่ายเอกสาร A4 (รีม)',
    category: 'กระดาษ',
    unit: 'รีม',
    quantity: 40,
    reorderPoint: 20,
    price: '120.00',
  },
  {
    sku: 'SKU-1004',
    name: 'หมึกพิมพ์ HP 680 ดำ',
    category: 'หมึกพิมพ์',
    unit: 'กล่อง',
    quantity: 0,
    reorderPoint: 5,
    price: '350.00',
  },
  {
    sku: 'SKU-1005',
    name: 'กาวแท่ง',
    category: 'อุปกรณ์สำนักงาน',
    unit: 'แท่ง',
    quantity: 200,
    reorderPoint: 50,
    price: '15.00',
  },
  {
    sku: 'SKU-1006',
    name: 'เทปใส 1 นิ้ว',
    category: 'อุปกรณ์สำนักงาน',
    unit: 'ม้วน',
    quantity: 15,
    reorderPoint: 30,
    price: '18.00',
  },
  {
    sku: 'SKU-1007',
    name: 'แฟ้มเอกสาร 2 ห่วง',
    category: 'จัดเก็บเอกสาร',
    unit: 'ชิ้น',
    quantity: 120,
    reorderPoint: 40,
    price: '45.00',
  },
]

async function main() {
  // เริ่มใหม่ทุกครั้ง (idempotent) — ลบ transaction ก่อนเพราะอ้างถึง product
  await prisma.stockTransaction.deleteMany()
  await prisma.product.deleteMany()

  for (const p of products) {
    await prisma.product.create({
      data: {
        ...p,
        // ยอดตั้งต้นบันทึกเป็น transaction รับเข้า เพื่อให้ quantity สอดคล้องกับประวัติ
        transactions:
          p.quantity > 0
            ? {
                create: {
                  type: 'IN',
                  quantity: p.quantity,
                  note: 'ยอดยกมา (seed)',
                },
              }
            : undefined,
      },
    })
  }

  const [productCount, txCount] = await Promise.all([
    prisma.product.count(),
    prisma.stockTransaction.count(),
  ])
  console.log(`Seed done: ${productCount} products, ${txCount} transactions`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
