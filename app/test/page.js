'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')

      console.log('DATA:', data)
      console.log('ERROR:', error)
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h1>Test Supabase Connection</h1>
      <p>เปิด F12 → Console ดูผลลัพธ์</p>
    </div>
  )
}
