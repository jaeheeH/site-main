'use client'

import { useEffect, useState } from 'react'
import { supabase } from 'shared/api/supabaseClient'

export default function TestPage() {
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('test').select('*')
      console.log('✅ Supabase 응답:', data, error)
      if (error) setError(error.message)
      else setData(data || [])
    }
    fetchData()
  }, [])
  console.log('✅ Supabase 응답:', data, error);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🧩 Supabase 연결 테스트</h1>
      {error && <p className="text-red-500 mb-2">❌ Error: {error}</p>}
      <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
