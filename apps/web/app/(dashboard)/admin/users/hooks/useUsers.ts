// apps/web/app/(dashboard)/admin/users/hooks/useUsers.ts

import { useState, useEffect } from 'react'
import { supabase } from '@/shared/api/supabaseClient'
import { User } from '../types'
import { deleteAvatarFromStorage } from '../utils/avatarUtils'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
      setFilteredUsers(data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter])

  const deleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    
    if (user?.avatar_url) {
      try {
        await deleteAvatarFromStorage(user.avatar_url)
      } catch (error) {
        console.warn('아바타 삭제 실패:', error)
      }
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error
    await fetchUsers()
  }

  const deleteMultipleUsers = async (userIds: string[]) => {
    const selectedUserData = users.filter(u => userIds.includes(u.id))
    
    for (const user of selectedUserData) {
      if (user.avatar_url) {
        try {
          await deleteAvatarFromStorage(user.avatar_url)
        } catch (error) {
          console.warn('아바타 삭제 실패:', error)
        }
      }
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .in('id', userIds)

    if (error) throw error
    await fetchUsers()
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error
    await fetchUsers()
  }

  return {
    users,
    filteredUsers,
    loading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    fetchUsers,
    deleteUser,
    deleteMultipleUsers,
    updateUser,
  }
}