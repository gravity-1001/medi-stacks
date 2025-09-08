import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useStacks } from '@/contexts/StacksContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import MedicalLogo from '@/components/MedicalLogo'
import { motion } from 'framer-motion'
import { 
  Activity, 
  FileText, 
  Users, 
  Search, 
  AlertTriangle, 
  Settings,
  LogOut,
  Shield,
  Stethoscope,
  FlaskConical,
  UserRound
} from 'lucide-react'
import { cn } from '@/lib/utils'

const Layout = () => {
  const { isSignedIn, userData, signOut } = useStacks()
  const { userRoles, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isSignedIn) {
    navigate('/login')
    return null
  }

  // Get user's selected role from localStorage
  const selectedRole = localStorage.getItem('medistacks.selectedRole')
  
  // Role-specific navigation
  const getNavigationForRole = (role: string | null) => {
    const baseNav = [
      { name: 'Dashboard', href: '/app', icon: Activity },
      { name: 'Settings', href: '/app/settings', icon: Settings },
    ]
    
    switch (role) {
      case 'patient':
        return [
          ...baseNav.slice(0, 1), // Dashboard
          { name: 'My Records', href: '/app/records', icon: FileText },
          { name: 'Consent Policies', href: '/app/consent-policies', icon: Shield },
          { name: 'Access Requests', href: '/app/access-requests', icon: Users },
          { name: 'Research Hub', href: '/app/research', icon: Search },
          ...baseNav.slice(1), // Settings
        ]
      case 'doctor':
        return [
          ...baseNav.slice(0, 1), // Dashboard
          { name: 'Patient Records', href: '/app/records', icon: FileText },
          { name: 'Access Requests', href: '/app/access-requests', icon: Users },
          { name: 'Emergency Access', href: '/app/emergency', icon: AlertTriangle },
          ...baseNav.slice(1), // Settings
        ]
      case 'researcher':
        return [
          ...baseNav.slice(0, 1), // Dashboard
          { name: 'Data Marketplace', href: '/app/research', icon: Search },
          { name: 'My Studies', href: '/app/records', icon: FileText },
          { name: 'Access Requests', href: '/app/access-requests', icon: Users },
          ...baseNav.slice(1), // Settings
        ]
      default:
        return baseNav
    }
  }
  
  const navigation = getNavigationForRole(selectedRole)

  return (
    <div className="min-h-screen crazy-gradient">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-lime-500/10 rounded-full blur-xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-24 h-24 bg-teal-500/15 rounded-full blur-lg"
          animate={{
            rotate: [0, 360, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-[#A7D7C5]/90 via-[#74B49B]/80 to-[#A7D7C5]/90 backdrop-blur-lg border-b border-[#1A3C40]/10 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="flex items-center space-x-3">
                <MedicalLogo size="md" animated={true} />
                <h1 className="text-3xl font-black text-[#1A3C40]">
                  MediStacks
                </h1>
              </div>
            </motion.div>
            
            <div className="flex items-center space-x-6">
              {/* User Role */}
              <div className="flex items-center space-x-3">
                {selectedRole && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-[#1A3C40] text-[#F9F8EB] shadow-md"
                  >
                    {selectedRole === 'patient' && <UserRound className="h-4 w-4 mr-2" />}
                    {selectedRole === 'doctor' && <Stethoscope className="h-4 w-4 mr-2" />}
                    {selectedRole === 'researcher' && <FlaskConical className="h-4 w-4 mr-2" />}
                    {selectedRole.toUpperCase()}
                  </motion.span>
                )}
                {userRoles.length > 0 && userRoles.map((role, index) => (
                  <motion.span
                    key={role}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#2D4B43] text-[#F9F8EB] shadow-sm"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {role}
                  </motion.span>
                ))}
              </div>
              
              {/* User Info */}
              <motion.div 
                className="text-[#1A3C40] font-medium flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
              >
                {loading ? (
                  <motion.div 
                    className="h-5 w-24 bg-[#2D4B43]/10 rounded animate-pulse"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                ) : (
                  <span>{userData?.profile?.name || ''}</span>
                )}
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="ghost" 
                  className="bg-[#1A3C40] hover:bg-[#2D4B43] text-[#F9F8EB] px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  SIGN OUT
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <nav className="w-72 bg-gradient-to-b from-[#F9F8EB]/80 via-white/70 to-[#F9F8EB]/80 backdrop-blur-lg border-r border-[#1A3C40]/10 min-h-screen shadow-lg">
          <div className="p-8">
            <div className="space-y-4">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href
                return (
                  <motion.button
                    key={item.name}
                    onClick={() => navigate(item.href)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ 
                      scale: 1.05, 
                      x: 10,
                      transition: { type: "spring", stiffness: 300 }
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "w-full flex items-center px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 group",
                      isActive
                        ? "bg-[#1A3C40] text-[#F9F8EB] shadow-md"
                        : "text-[#1A3C40] hover:bg-[#1A3C40]/5 hover:text-[#1A3C40] border border-transparent hover:border-[#1A3C40]/20"
                    )}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <item.icon className={cn(
                        "h-6 w-6 mr-4 text-[#2D4B43]"
                      )} />
                    </motion.div>
                    <span className="tracking-wide">
                      {item.name.toUpperCase()}
                    </span>
                  </motion.button>
                )
              })}
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-[#1A3C40] text-sm font-medium">
                Stacks Network Active
              </p>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 relative">
          <div className="max-w-7xl mx-auto relative z-10">
            {loading ? (
              <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg rounded-xl">
                <motion.div 
                  className="w-16 h-16 border-4 border-[#1A3C40]/20 border-t-[#1A3C40] rounded-full mx-auto animate-dna-spin"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <motion.p 
                  className="mt-6 text-[#1A3C40] text-xl font-medium"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Loading permissions...
                </motion.p>
              </Card>
            ) : (
              <Outlet />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
