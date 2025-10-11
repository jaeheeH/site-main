// apps/web/app/(dashboard)/admin/users/components/RoleDialog.tsx

import { Role, RoleFormData } from '../types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { isDefaultRole } from '../utils/userUtils'

interface RoleDialogProps {
  open: boolean
  role: Role | null
  formData: RoleFormData
  onOpenChange: (open: boolean) => void
  onFormDataChange: (data: RoleFormData) => void
  onSave: () => void
}

export function RoleDialog({
  open,
  role,
  formData,
  onOpenChange,
  onFormDataChange,
  onSave,
}: RoleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {role ? '역할 수정' : '역할 추가'}
          </DialogTitle>
          <DialogDescription>
            역할명과 권한을 설정해주세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">역할명 *</Label>
            <Input
              id="role-name"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              placeholder="예: manager, viewer"
              disabled={role !== null && isDefaultRole(role.name)}
            />
            {role && isDefaultRole(role.name) && (
              <p className="text-xs text-muted-foreground">기본 역할의 이름은 변경할 수 없습니다.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">설명</Label>
            <Textarea
              id="role-description"
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              placeholder="역할에 대한 설명을 입력하세요"
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>권한 설정</Label>
            
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm-dashboard"
                  checked={formData.permissions.dashboard}
                  onCheckedChange={(checked) =>
                    onFormDataChange({
                      ...formData,
                      permissions: { ...formData.permissions, dashboard: checked as boolean }
                    })
                  }
                />
                <label htmlFor="perm-dashboard" className="text-sm font-medium leading-none">
                  대시보드 접근
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm-users"
                  checked={formData.permissions.users}
                  onCheckedChange={(checked) =>
                    onFormDataChange({
                      ...formData,
                      permissions: { ...formData.permissions, users: checked as boolean }
                    })
                  }
                />
                <label htmlFor="perm-users" className="text-sm font-medium leading-none">
                  사용자 관리
                </label>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">컨텐츠 관리</div>
                <div className="ml-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="perm-content-read"
                      checked={formData.permissions.content.read}
                      onCheckedChange={(checked) =>
                        onFormDataChange({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            content: { ...formData.permissions.content, read: checked as boolean }
                          }
                        })
                      }
                    />
                    <label htmlFor="perm-content-read" className="text-sm">읽기</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="perm-content-write"
                      checked={formData.permissions.content.write}
                      onCheckedChange={(checked) =>
                        onFormDataChange({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            content: { ...formData.permissions.content, write: checked as boolean }
                          }
                        })
                      }
                    />
                    <label htmlFor="perm-content-write" className="text-sm">작성</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="perm-content-update"
                      checked={formData.permissions.content.update}
                      onCheckedChange={(checked) =>
                        onFormDataChange({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            content: { ...formData.permissions.content, update: checked as boolean }
                          }
                        })
                      }
                    />
                    <label htmlFor="perm-content-update" className="text-sm">수정</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="perm-content-delete"
                      checked={formData.permissions.content.delete}
                      onCheckedChange={(checked) =>
                        onFormDataChange({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            content: { ...formData.permissions.content, delete: checked as boolean }
                          }
                        })
                      }
                    />
                    <label htmlFor="perm-content-delete" className="text-sm">삭제</label>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm-media"
                  checked={formData.permissions.media}
                  onCheckedChange={(checked) =>
                    onFormDataChange({
                      ...formData,
                      permissions: { ...formData.permissions, media: checked as boolean }
                    })
                  }
                />
                <label htmlFor="perm-media" className="text-sm font-medium leading-none">
                  미디어 관리
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="perm-settings"
                  checked={formData.permissions.settings}
                  onCheckedChange={(checked) =>
                    onFormDataChange({
                      ...formData,
                      permissions: { ...formData.permissions, settings: checked as boolean }
                    })
                  }
                />
                <label htmlFor="perm-settings" className="text-sm font-medium leading-none">
                  환경설정
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onSave}>
            {role ? '수정' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}