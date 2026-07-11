import { useEffect, useState } from 'react'
import * as usersApi from '../services/api/users.js'

export function useUsers() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const data = await usersApi.getUsers()
        if (isMounted) setUsers(data)
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [])

  const addUser = async (data) => {
    try {
      const created = await usersApi.addUser(data)
      setUsers((prev) => [...prev, created])
      setError(null)
      return created
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const updateUser = async (id, patch) => {
    const existing = users.find((user) => user.id === id)
    if (!existing) return null
    try {
      const updated = await usersApi.updateUser(id, { ...existing, ...patch })
      setUsers((prev) => prev.map((user) => (user.id === id ? updated : user)))
      setError(null)
      return updated
    } catch (err) {
      setError(err.message)
      return null
    }
  }

  const deleteUser = async (id) => {
    try {
      await usersApi.deleteUser(id)
      setUsers((prev) => prev.filter((user) => user.id !== id))
      setError(null)
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  return { users, isLoading, error, addUser, updateUser, deleteUser }
}
