import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useStacks } from '@/contexts/StacksContext'

const RoleHome = () => {
  const navigate = useNavigate()
  const { selectedRole } = useAuth()
  const { isSignedIn } = useStacks()

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/login')
      return
    }
    
    // Check localStorage for selected role as fallback
    const storedRole = localStorage.getItem('medistacks.selectedRole')
    const roleToUse = selectedRole || storedRole
    
    if (!roleToUse) {
      // No role selected, go to onboarding to select
      navigate('/onboarding')
      return
    }
    
    // Navigate to role-specific dashboard
    if (roleToUse === 'doctor') navigate('/app/doctor')
    else if (roleToUse === 'researcher') navigate('/app/researcher')
    else navigate('/app/patient')
  }, [isSignedIn, selectedRole, navigate])

  return null
}

export default RoleHome
