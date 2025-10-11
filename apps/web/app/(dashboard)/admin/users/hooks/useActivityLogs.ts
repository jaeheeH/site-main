// apps/web/app/(dashboard)/admin/users/hooks/useActivityLogs.ts

import { useState, useEffect } from 'react'
import { supabase } from '@/shared/api/supabaseClient'
import { ActivityLog } from '../types'

export function useActivityLogs() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchActivityLogs = async (limit: number = 10) => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          users:user_id (
            username,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      setActivityLogs(data || [])
    } catch (error) {
      console.error('Failed to fetch activity logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivityLogs()
  }, [])

  return {
    activityLogs,
    loading,
    fetchActivityLogs,
  }
}