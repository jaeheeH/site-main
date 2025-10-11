// apps/web/app/(dashboard)/admin/users/page.tsx

'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusIcon, SearchIcon, Trash2 } from "lucide-react"

// Types
import { User, RoleFormData } from './types'

// Hooks
import { useUsers } from './hooks/useUsers'
import { useRoles } from './hooks/useRoles'
import { useActivityLogs } from './hooks/useActivityLogs'

// Components
import { UserTable } from './components/UserTable'
import { UserEditDialog } from './components/UserEditDialog'
import { RoleManagementCard } from './components/RoleManagementCard'
import { RoleDialog } from './components/RoleDialog'
import { ActivityLogCard } from './components/ActivityLogCard'

// Utils
import { isDefaultRole, createDefaultPermissions, normalizePermissions } from './utils/userUtils'

export default function UsersPage() {
  const {
    filteredUsers,
    loading: usersLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    fetchUsers,
    deleteUser,
    deleteMultipleUsers,
  } = useUsers()

  const { roles } = useRoles(filteredUsers)
  const { activityLogs } = useActivityLogs()

  const [selectedUsers, setSelectedUsers] = useState<string[]>([])

  // 사용자 수정 Dialog
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // 역할 Dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [roleFormData, setRoleFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: createDefaultPermissions()
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleDeleteSelected = async () => {
    if (!confirm(`선택한 ${selectedUsers.length}명의 사용자를 삭제하시겠습니까?`)) {
      return
    }

    try {
      await deleteMultipleUsers(selectedUsers)
      alert('삭제되었습니다.')
      setSelectedUsers([])
    } catch (error) {
      console.error('Failed to delete users:', error)
      alert('삭제 실패')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('이 사용자를 삭제하시겠습니까?')) {
      return
    }

    try {
      await deleteUser(userId)
      alert('삭제되었습니다.')
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('삭제 실패')
    }
  }

  const openEditUserDialog = (user: User) => {
    setEditingUser(user)
    setUserDialogOpen(true)
  }

  const handleUserSaved = () => {
    setUserDialogOpen(false)
    fetchUsers()
  }

  const openAddRoleDialog = () => {
    setEditingRole(null)
    setRoleFormData({
      name: '',
      description: '',
      permissions: createDefaultPermissions()
    })
    setRoleDialogOpen(true)
  }

  const openEditRoleDialog = (role: any) => {
    setEditingRole(role)
    setRoleFormData({
      name: role.name,
      description: role.description || '',
      permissions: normalizePermissions(role.permissions)
    })
    setRoleDialogOpen(true)
  }

  const handleSaveRole = async () => {
    try {
      if (!roleFormData.name) {
        alert('역할명을 입력해주세요.')
        return
      }

      const { supabase } = await import('@/shared/api/supabaseClient')

      if (editingRole) {
        const { error } = await supabase
          .from('roles')
          .update({
            name: roleFormData.name,
            description: roleFormData.description,
            permissions: roleFormData.permissions,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingRole.id)

        if (error) throw error
        alert('역할이 수정되었습니다.')
      } else {
        const { error } = await supabase
          .from('roles')
          .insert({
            name: roleFormData.name,
            description: roleFormData.description,
            permissions: roleFormData.permissions
          })

        if (error) throw error
        alert('역할이 추가되었습니다.')
      }

      setRoleDialogOpen(false)
      fetchUsers()
    } catch (error: any) {
      console.error('Failed to save role:', error)
      if (error.code === '23505') {
        alert('이미 존재하는 역할명입니다.')
      } else {
        alert('저장 실패: ' + error.message)
      }
    }
  }

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (isDefaultRole(roleName)) {
      alert('기본 역할은 삭제할 수 없습니다.')
      return
    }

    if (!confirm('이 역할을 삭제하시겠습니까?')) {
      return
    }

    try {
      const { supabase } = await import('@/shared/api/supabaseClient')
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId)

      if (error) throw error

      alert('삭제되었습니다.')
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete role:', error)
      alert('삭제 실패')
    }
  }

  if (usersLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">사용자 관리</h1>
        <p className="text-muted-foreground">
          사용자 목록 및 권한을 관리합니다
        </p>
      </div>

      {/* 사용자 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>사용자 목록</CardTitle>
              <CardDescription>
                전체 {filteredUsers.length}명의 사용자
              </CardDescription>
            </div>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              사용자 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색 및 필터 */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="이름, 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="역할 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.description || role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedUsers.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteSelected}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                선택 삭제 ({selectedUsers.length})
              </Button>
            )}
          </div>

          {/* 사용자 테이블 */}
          <UserTable
            users={filteredUsers}
            selectedUsers={selectedUsers}
            onSelectAll={handleSelectAll}
            onSelectUser={handleSelectUser}
            onEdit={openEditUserDialog}
            onDelete={handleDeleteUser}
          />
        </CardContent>
      </Card>

      {/* 역할 관리 */}
      <RoleManagementCard
        roles={roles}
        onAdd={openAddRoleDialog}
        onEdit={openEditRoleDialog}
        onDelete={handleDeleteRole}
      />

      {/* 활동 로그 */}
      <ActivityLogCard logs={activityLogs} />

      {/* 사용자 수정 Dialog */}
      <UserEditDialog
        open={userDialogOpen}
        user={editingUser}
        onOpenChange={setUserDialogOpen}
        onSave={handleUserSaved}
      />

      {/* 역할 Dialog */}
      <RoleDialog
        open={roleDialogOpen}
        role={editingRole}
        formData={roleFormData}
        onOpenChange={setRoleDialogOpen}
        onFormDataChange={setRoleFormData}
        onSave={handleSaveRole}
      />
    </div>
  )
}