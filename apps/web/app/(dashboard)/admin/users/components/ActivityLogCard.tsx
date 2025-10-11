// apps/web/app/(dashboard)/admin/users/components/ActivityLogCard.tsx

import { ActivityLog } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getActionLabel } from '../utils/userUtils'

interface ActivityLogCardProps {
  logs: ActivityLog[]
}

export function ActivityLogCard({ logs }: ActivityLogCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 활동 로그</CardTitle>
        <CardDescription>
          사용자들의 최근 활동 내역입니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>시간</TableHead>
                <TableHead>사용자</TableHead>
                <TableHead>활동</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    활동 로그가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(log.created_at).toLocaleString('ko-KR')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {(log.users as any)?.full_name || (log.users as any)?.username || '알 수 없음'}
                    </TableCell>
                    <TableCell>{getActionLabel(log.action)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {logs.length > 0 && (
          <div className="mt-4 text-center">
            <Button variant="outline">더보기</Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}