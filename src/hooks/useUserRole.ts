import { useState, useEffect } from 'react'
import { useAppStore } from '@/stores/authStore'

type Role = 'USER' | 'ADMIN' | 'MANAGER' | 'MASTER' | 'COURIER'

interface UseUserRoleReturn {
  role: Role | null
  isLoading: boolean
  isAdmin: boolean
  isManager: boolean
  isMaster: boolean
  isCourier: boolean
  hasAdminAccess: boolean
}

export function useUserRole(): UseUserRoleReturn {
  const { telegramId } = useAppStore()
  const [role, setRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      const id = telegramId || (typeof window !== 'undefined' ? sessionStorage.getItem('telegramId') : null)

      if (!id) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch('/api/user/role', {
          headers: { 'x-telegram-id': id.toString() },
        })

        if (res.ok) {
          const data = await res.json()
          setRole(data.role)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRole()
  }, [telegramId])

  const isAdmin = role === 'ADMIN'
  const isManager = role === 'MANAGER'
  const isMaster = role === 'MASTER'
  const isCourier = role === 'COURIER'
  const hasAdminAccess = isAdmin || isManager || isMaster || isCourier

  return { role, isLoading, isAdmin, isManager, isMaster, isCourier, hasAdminAccess }
}

// Section visibility matrix by role
export function getSectionsForRole(role: Role | null): string[] {
  switch (role) {
    case 'ADMIN':
      return ['staff', 'masters', 'requests', 'orders', 'add-lot', 'chats', 'leads', 'trade-in', 'repair']
    case 'MANAGER':
      return ['requests', 'orders', 'add-lot', 'chats', 'leads', 'trade-in', 'repair']
    case 'MASTER':
      return ['requests', 'trade-in', 'repair']
    case 'COURIER':
      return ['orders', 'repair']
    default:
      return []
  }
}
