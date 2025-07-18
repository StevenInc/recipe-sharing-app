'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types/database'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.replace('/login')
        return
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) {
        setError(error.message)
      } else {
        setProfile(data)
      }
      setLoading(false)
    }
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>
  if (!profile) return null

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome, {profile.full_name || profile.username}!</h1>
        <div className="text-gray-700 mb-4">Email: {profile.email}</div>
        <div className="text-gray-700 mb-4">Username: {profile.username}</div>
        <button
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded transition"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </div>
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Recipes</h2>
          <button
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded transition"
            onClick={() => router.push('/dashboard/add-recipe')}
          >
            Add Recipe
          </button>
        </div>
        <div className="bg-white rounded shadow p-6 text-gray-400 text-center">
          (Recipe list coming soon)
        </div>
      </div>
    </div>
  )
}