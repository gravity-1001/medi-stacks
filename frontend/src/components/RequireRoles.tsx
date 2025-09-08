import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useStacks } from '@/contexts/StacksContext'
import { useAuth } from '@/contexts/AuthContext'

interface Props {
  allowed: string[]
}

const RequireRoles = ({ allowed }: Props) => {
  const { isSignedIn } = useStacks()
  const { userRoles, loading } = useAuth()
  const location = useLocation()

  if (!isSignedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (loading) {
    return null
  }

  // Check both blockchain roles and localStorage selected role
  const selectedRole = localStorage.getItem('medistacks.selectedRole')
  const hasBlockchainRole = userRoles.some((r) => allowed.includes(r) || (r === 'admin'))
  const hasSelectedRole = selectedRole && allowed.includes(selectedRole)
  
  // Allow access if user has blockchain role OR if they have selected a matching role
  if (!hasBlockchainRole && !hasSelectedRole) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />
  }

  return <Outlet />
}

export default RequireRoles
