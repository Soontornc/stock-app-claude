import { notFound } from 'next/navigation'
import { updateTransaction } from '@/app/transactions/actions'
import { PageHeader } from '@/components/page-header'
import { TransactionEditForm } from '@/components/transaction-edit-form'
import { prisma } from '@/lib/prisma'

const timeFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: Props) {
  const { id } = await params
  const transaction = await prisma.stockTransaction.findUnique({
    where: { id },
    include: { product: { select: { sku: true, name: true, unit: true } } },
  })

  if (!transaction) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="แก้ไขรายการเคลื่อนไหว"
        subtitle={`${transaction.type === 'IN' ? 'รับเข้า' : 'เบิกจ่าย'} · ${transaction.product.sku} · ${timeFormatter.format(transaction.createdAt)}`}
      />
      <TransactionEditForm
        action={updateTransaction.bind(null, transaction.id)}
        productName={transaction.product.name}
        unit={transaction.product.unit}
        type={transaction.type}
        defaultQuantity={transaction.quantity}
        defaultNote={transaction.note ?? ''}
      />
    </div>
  )
}
