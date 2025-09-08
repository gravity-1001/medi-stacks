import React, { createContext, useContext, useEffect, useState } from 'react'
import { useStacks } from './StacksContext'
import { stringAsciiCV, principalCV } from '@stacks/transactions'

interface AuthContextType {
  userRole: string | null
  userRoles: string[]
  selectedRole: string | null
  setSelectedRole: (role: string | null) => void
  userExists: boolean
  isAdmin: boolean
  isDoctor: boolean
  isResearcher: boolean
  isEmergencyResponder: boolean
  isVerifier: boolean
  loading: boolean
  checkUserRole: (role: string) => Promise<boolean>
  refreshUserRoles: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, userData, callReadOnlyFunction } = useStacks()
  const [userRoles, setUserRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRole, _setSelectedRole] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('medistacks.selectedRole') : null
  )
  const [userExists, setUserExists] = useState(false)

  const roles = ['admin', 'doctor', 'researcher', 'emergency_responder', 'verifier']

  const checkUserRole = async (role: string): Promise<boolean> => {
    if (!isSignedIn || !userData) return false
    
    try {
      const result = await callReadOnlyFunction('has-role', [
        principalCV(userData.profile.stxAddress.testnet),
        stringAsciiCV(role)
      ])
      return result.value === true
    } catch (error) {
      console.error(`Error checking role ${role}:`, error)
      return false
    }
  }

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  const refreshUserRoles = async () => {
    if (!isSignedIn || !userData) {
      setUserRoles([])
      setUserExists(false)
      return
    }

    setLoading(true)
    try {
      const active: string[] = []
      for (let i = 0; i < roles.length; i++) {
        const role = roles[i]
        const hasRole = await checkUserRole(role)
        if (hasRole) active.push(role)
        // Small delay between calls to reduce 429 rate limit hits
        await sleep(200)
      }
      
      setUserRoles(active)
      
      // User exists if they have any roles OR if they've been onboarded before (stored locally)
      const hasBeenOnboarded = typeof window !== 'undefined' && localStorage.getItem('medistacks.onboarded') === 'true'
      setUserExists(active.length > 0 || hasBeenOnboarded)
    } catch (error) {
      console.error('Error refreshing user roles:', error)
      setUserRoles([])
      setUserExists(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isSignedIn) {
      // Debounce initial refresh slightly to avoid burst on mount
      const t = setTimeout(() => {
        refreshUserRoles()
      }, 300)
      return () => clearTimeout(t)
    } else {
      setUserRoles([])
    }
  }, [isSignedIn, userData])

  const setSelectedRole = (role: string | null) => {
    _setSelectedRole(role)
    if (typeof window !== 'undefined') {
      if (role) localStorage.setItem('medistacks.selectedRole', role)
      else localStorage.removeItem('medistacks.selectedRole')
    }
  }

  const value: AuthContextType = {
    userRole: userRoles[0] || null,
    userRoles,
    selectedRole,
    setSelectedRole,
    userExists,
    isAdmin: userRoles.includes('admin'),
    isDoctor: userRoles.includes('doctor'),
    isResearcher: userRoles.includes('researcher'),
    isEmergencyResponder: userRoles.includes('emergency_responder'),
    isVerifier: userRoles.includes('verifier'),
    loading,
    checkUserRole,
    refreshUserRoles,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
