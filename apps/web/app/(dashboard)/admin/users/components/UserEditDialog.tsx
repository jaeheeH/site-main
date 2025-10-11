// apps/web/app/(dashboard)/admin/users/components/UserEditDialog.tsx

import { useState, useEffect } from 'react' // useEffect 추가
import { User, UserFormData } from '../types'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { uploadAvatar, deleteAvatarFromStorage } from '../utils/avatarUtils'
import { supabase } from '@/shared/api/supabaseClient'

interface UserEditDialogProps {
  open: boolean
  user: User | null
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function UserEditDialog({ open, user, onOpenChange, onSave }: UserEditDialogProps) {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    full_name: '',
    role: 'user',
    is_active: true,
    avatar_url: '',
  })
  
  // user가 변경될 때마다 formData 업데이트
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        full_name: user.full_name || '',
        role: user.role || 'user',
        is_active: user.is_active ?? true,
        avatar_url: user.avatar_url || '',
      })
    }
  }, [user])

  const handleSave = async () => {
    try {
      if (!user) return

      if (!formData.username || !formData.full_name) {
        alert('닉네임과 이름을 입력해주세요.')
        return
      }

      const { error } = await supabase
        .from('users')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          role: formData.role,
          is_active: formData.is_active,
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      alert('사용자 정보가 수정되었습니다.')
      onSave()
    } catch (error: any) {
      console.error('Failed to update user:', error)
      if (error.code === '23505') {
        alert('이미 존재하는 닉네임입니다.')
      } else {
        alert('수정 실패: ' + error.message)
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      const publicUrl = await uploadAvatar(file, user.id, formData.avatar_url)
      setFormData({ ...formData, avatar_url: publicUrl })
      alert('이미지가 업로드되었습니다.')
    } catch (error: any) {
      console.error('아바타 업로드 실패:', error)
      alert('이미지 업로드에 실패했습니다: ' + error.message)
    }

    e.target.value = ''
  }

  const handleRemoveAvatar = async () => {
    if (!confirm('아바타를 제거하시겠습니까?')) return

    try {
      if (formData.avatar_url) {
        await deleteAvatarFromStorage(formData.avatar_url)
      }
      setFormData({ ...formData, avatar_url: '' })
      alert('아바타가 제거되었습니다.')
    } catch (error) {
      console.error('아바타 제거 실패:', error)
      alert('아바타 제거에 실패했습니다.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>사용자 정보 수정</DialogTitle>
          <DialogDescription>
            사용자 정보를 수정해주세요
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="user-username">닉네임 *</Label>
            <Input
              id="user-username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="닉네임"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-fullname">이름 *</Label>
            <Input
              id="user-fullname"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="이름"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-avatar">아바타 이미지</Label>
            
            {formData.avatar_url && (
              <div className="flex items-center gap-4">
                <img 
                  src={formData.avatar_url} 
                  alt="현재 아바타" 
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" font-size="24" text-anchor="middle" dy=".3em" fill="%23999"%3E?%3C/text%3E%3C/svg%3E'
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                >
                  제거
                </Button>
              </div>
            )}
            
            <Input
              id="user-avatar"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG, GIF 형식, 자동으로 최적화됩니다 (400x400, 1MB 이하)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-role">역할 *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger id="user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">사용자</SelectItem>
                <SelectItem value="editor">편집자</SelectItem>
                <SelectItem value="admin">관리자</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="user-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_active: checked as boolean })
              }
            />
            <label 
              htmlFor="user-active" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              계정 활성화
            </label>
          </div>

          {!formData.is_active && (
            <Alert>
              <AlertDescription>
                비활성화된 계정은 로그인할 수 없습니다.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={handleSave}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}