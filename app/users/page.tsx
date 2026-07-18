import { PageHeader } from '@/components/page-header'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { prisma } from '@/lib/prisma'
import { getInitial } from '@/lib/utils'

const dateFormatter = new Intl.DateTimeFormat('th-TH', {
  dateStyle: 'medium',
})

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="space-y-6">
      <PageHeader
        title="ผู้ใช้งาน"
        subtitle={`ผู้ใช้ทั้งหมดในระบบ (${users.length} คน) — ทุกบัญชีมีสิทธิ์การใช้งานเท่ากัน`}
      />

      <div className="border-border bg-card overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ผู้ใช้งาน</TableHead>
              <TableHead>อีเมล</TableHead>
              <TableHead className="text-center">ยืนยันอีเมล</TableHead>
              <TableHead className="text-right">วันที่สมัคร</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-10 text-center"
                >
                  ยังไม่มีผู้ใช้งานในระบบ
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="bg-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                        {getInitial(u.name, u.email)}
                      </div>
                      <span className="font-semibold">{u.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.email}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Badge variant={u.emailVerified ? 'default' : 'outline'}>
                        {u.emailVerified ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right">
                    {dateFormatter.format(u.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
