import { useState, useEffect, useCallback } from 'react'
import { getMe, updateMe } from '../api/user'
import { User } from '../types/user'
import { useAuth } from './useAuth'

export const useUser = () => {
  const { user: authUser, initializing } = useAuth()
  const [user, setUser] = useState<User | null>(authUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setUser(authUser)
  }, [authUser])

  const fetchUser = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const me = await getMe()
      setUser(me)
    } catch (err: any) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (data: Partial<User>) => {
    setLoading(true)
    setError(null)
    try {
      const updated = await updateMe(data)
      setUser(updated)
      return updated
    } catch (err: any) {
      setError(err.response?.data?.error || err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initializing) {
      fetchUser()
    }
  }, [initializing, fetchUser])

  return { user, loading, error, refresh: fetchUser, updateUser }
}
