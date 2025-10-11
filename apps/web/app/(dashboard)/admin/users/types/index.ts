// apps/web/app/(dashboard)/admin/users/types/index.ts

export interface User {
  id: string
  email: string
  username: string | null
  full_name: string | null
  role: string
  avatar_url: string | null
  is_active: boolean
  created_at: string
  last_login_at: string | null
}

export interface Role {
  id: string
  name: string
  description: string | null
  permissions: any
  created_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  resource_type: string | null
  resource_id: string | null
  created_at: string
  users: {
    username: string | null
    full_name: string | null
  }
}

export interface RoleFormData {
  name: string
  description: string
  permissions: {
    dashboard: boolean
    users: boolean
    content: {
      read: boolean
      write: boolean
      update: boolean
      delete: boolean
    }
    media: boolean
    settings: boolean
  }
}

export interface UserFormData {
  username: string
  full_name: string
  role: string
  is_active: boolean
  avatar_url: string
}