// apps/web/app/(dashboard)/admin/users/hooks/useRoles.ts

import { useState, useEffect } from 'react'
import { supabase } from '@/shared/api/supabaseClient'
import { Role, User } from '../types'

export function useRoles(users: User[]) {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('name')

      if (error) throw error

      const rolesWithCount = data?.map(role => ({
        ...role,
        user_count: users.filter(user => user.role === role.name).length || 0
      }))

      setRoles(rolesWithCount || [])
    } catch (error) {
      console.error('Failed to fetch roles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoles()
  }, [users])

  const createRole = async (roleData: Omit<Role, 'id' | 'created_at'>) => {
    const { error } = await supabase
      .from('roles')
      .insert(roleData)

    if (error) throw error
    await fetchRoles()
  }

  const updateRole = async (roleId: string, updates: Partial<Role>) => {
    const { error } = await supabase
      .from('roles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', roleId)

    if (error) throw error
    await fetchRoles()
  }

  const deleteRole = async (roleId: string) => {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId)

    if (error) throw error
    await fetchRoles()
  }

  return {
    roles,
    loading,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  }
}