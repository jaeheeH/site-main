// apps/web/app/(dashboard)/admin/users/components/RoleManagementCard.tsx

import { Role } from '../types'
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
import { PlusIcon, Pencil, Trash2 } from 'lucide-react'
import { isDefaultRole } from '../utils/userUtils'

interface RoleManagementCardProps {
  roles: Role[]
  onAdd: () => void
  onEdit: (role: Role) => void
  onDelete: (roleId: string, roleName: string) => void
}

export function RoleManagementCard({ roles, onAdd, onEdit, onDelete }: RoleManagementCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>권한/역할 관리</CardTitle>
            <CardDescription>
              역할별 권한을 관리합니다
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onAdd}>
            <PlusIcon className="mr-2 h-4 w-4" />
            역할 추가
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>역할명</TableHead>
                <TableHead>설명</TableHead>
                <TableHead>사용자 수</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    등록된 역할이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell>{(role as any).user_count || 0}명</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onEdit(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {!isDefaultRole(role.name) && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onDelete(role.id, role.name)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}