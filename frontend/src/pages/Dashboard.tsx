import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useStacks } from '@/contexts/StacksContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import MedicalLogo from '@/components/MedicalLogo'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Users, 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Eye,
  Zap,
  Brain,
  Heart,
  Sparkles
} from 'lucide-react'
import { formatDate, roleToDisplayName } from '@/lib/utils'

const Dashboard = () => {
  const { userRoles, isDoctor, isResearcher, isAdmin } = useAuth()
  const { userData } = useStacks()
  const [stats] = useState({
    totalRecords: 0,
    accessRequests: 0,
    researchEarnings: 0,
    recentActivity: []
  })

  const quickActions = [
    {
      title: 'Add Medical Record',
      description: 'Upload a new medical record',
      icon: Plus,
      action: () => console.log('Add record'),
      show: true
    },
    {
      title: 'View Access Requests',
      description: 'Review pending access requests',
      icon: Eye,
      action: () => console.log('View requests'),
      show: isDoctor || isAdmin
    },
    {
      title: 'Research Dashboard',
      description: 'Browse available research data',
      icon: TrendingUp,
      action: () => console.log('Research'),
      show: isResearcher
    },
    {
      title: 'Emergency Access',
      description: 'Enable emergency access mode',
      icon: AlertTriangle,
      action: () => console.log('Emergency'),
      show: true
    }
  ]

  return (
    <div className="space-y-12 relative">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-32 right-32 w-24 h-24 bg-lime-500/10 rounded-full blur-lg"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-32 left-32 w-32 h-32 bg-teal-500/10 rounded-full blur-xl"
          animate={{
            rotate: [0, 360, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      {/* Welcome Header */}
      <motion.div 
        className="relative bg-gradient-to-r from-dark-900/90 via-medical-900/80 to-dark-900/90 rounded-3xl p-12 text-white border-4 border-lime-500/30 neon-glow overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4">
            <MedicalLogo size="lg" animated={true} />
          </div>
          <motion.div
            className="absolute bottom-4 left-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Brain className="h-16 w-16 text-lime-400/30" />
          </motion.div>
        </div>

        <div className="relative z-10">
          <motion.h1 
            className="text-5xl font-black mb-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-teal-400 to-medical-400 animate-pulse-glow">
              Welcome to MediStacks,
            </span>
            <br />
            <span className="text-white">
              {userData?.profile?.name || 'QUANTUM USER'}!
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-2xl text-lime-200 mb-8 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            🧬 Manage your medical records securely on the blockchain 🚀
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {userRoles.map((role, index) => (
              <motion.span
                key={role}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="inline-flex items-center px-6 py-3 rounded-full text-base font-bold bg-gradient-to-r from-lime-500/30 to-teal-500/30 text-lime-300 border-2 border-lime-400/50 pulse-border animate-pulse-glow"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Shield className="h-5 w-5 mr-3 animate-medical-float" />
                </motion.div>
                {roleToDisplayName(role).toUpperCase()}
                <Sparkles className="h-4 w-4 ml-2 animate-dna-spin" />
              </motion.span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <motion.div
          whileHover={{ scale: 1.05, rotateY: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="shimmer-card bg-gradient-to-br from-lime-500/20 to-teal-500/20 border-2 border-lime-500/30 hover:border-lime-400/60 transition-all duration-300 neon-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-bold text-lime-300">Records</CardTitle>
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                <FileText className="h-8 w-8 text-lime-400 animate-medical-float" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white mb-2">{stats.totalRecords}</div>
              <p className="text-lime-200 font-medium">
                🧬 Your quantum medical data
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, rotateY: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="shimmer-card bg-gradient-to-br from-teal-500/20 to-medical-500/20 border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-300 neon-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-bold text-teal-300">ACCESS MATRIX</CardTitle>
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                <Users className="h-8 w-8 text-teal-400 animate-medical-float" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white mb-2">{stats.accessRequests}</div>
              <p className="text-teal-200 font-medium">
                🔐 Pending approvals
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, rotateY: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="shimmer-card bg-gradient-to-br from-medical-500/20 to-lime-500/20 border-2 border-medical-500/30 hover:border-medical-400/60 transition-all duration-300 neon-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-bold text-medical-300">QUANTUM EARNINGS</CardTitle>
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
              >
                <TrendingUp className="h-8 w-8 text-medical-400 animate-medical-float" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white mb-2">{stats.researchEarnings} STX</div>
              <p className="text-medical-200 font-medium">
                💰 From data transcendence
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, rotateY: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="shimmer-card bg-gradient-to-br from-green-500/20 to-lime-500/20 border-2 border-green-500/30 hover:border-green-400/60 transition-all duration-300 neon-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-bold text-green-300">SYSTEM PULSE</CardTitle>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="h-8 w-8 text-green-400 animate-heartbeat" />
              </motion.div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-green-400 mb-2">ONLINE</div>
              <p className="text-green-200 font-medium">
                ⚡ All systems active
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <h2 className="text-4xl font-black mb-8">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-teal-400">
            MediStacks Actions
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {quickActions
            .filter(action => action.show)
            .map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.05, 
                  rotateY: 10,
                  transition: { type: "spring", stiffness: 300 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="shimmer-card bg-gradient-to-br from-dark-900/80 to-teal-900/60 border-2 border-lime-500/30 hover:border-lime-400/60 transition-all duration-300 neon-glow cursor-pointer group" onClick={action.action}>
                  <CardHeader className="p-8">
                    <div className="flex items-center space-x-4">
                      <motion.div 
                        className="p-4 bg-gradient-to-br from-lime-500/30 to-teal-500/30 rounded-2xl border border-lime-400/30"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <action.icon className="h-8 w-8 text-lime-400 animate-medical-float" />
                      </motion.div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-lime-300 group-hover:text-white transition-colors">
                          {action.title.toUpperCase()}
                        </CardTitle>
                        <CardDescription className="text-teal-200 font-medium mt-2">
                          🚀 {action.description}
                        </CardDescription>
                      </div>
                      <motion.div
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Zap className="h-6 w-6 text-lime-400 animate-dna-spin" />
                      </motion.div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="shimmer-card bg-gradient-to-br from-teal-500/20 to-dark-900/80 border-2 border-teal-500/30 hover:border-teal-400/60 transition-all duration-300 neon-glow">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <Activity className="h-8 w-8 text-teal-400 animate-medical-float" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl font-bold text-teal-300">Recent Activity</CardTitle>
                  <CardDescription className="text-teal-200 font-medium">
                    🧬 Your latest medical record interactions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.length === 0 ? (
                  <motion.div 
                    className="text-center py-8"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Brain className="h-12 w-12 text-teal-400/60 mx-auto mb-4 animate-medical-float" />
                    <p className="text-teal-200 text-lg font-medium">Preparing your activity...</p>
                  </motion.div>
                ) : (
                  stats.recentActivity.map((activity: any, index: number) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-teal-500/10 to-lime-500/10 rounded-2xl border border-teal-400/20 hover:border-teal-400/40 transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                    >
                      <Activity className="h-6 w-6 text-teal-400 animate-medical-float" />
                      <div className="flex-1">
                        <p className="font-bold text-white">{activity.action}</p>
                        <p className="text-sm text-teal-200">{formatDate(activity.timestamp)}</p>
                      </div>
                      <Sparkles className="h-5 w-5 text-lime-400 animate-dna-spin" />
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card className="shimmer-card bg-gradient-to-br from-lime-500/20 to-dark-900/80 border-2 border-lime-500/30 hover:border-lime-400/60 transition-all duration-300 neon-glow">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Shield className="h-8 w-8 text-lime-400 animate-heartbeat" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl font-bold text-lime-300">SYSTEM MATRIX</CardTitle>
                  <CardDescription className="text-lime-200 font-medium">
                    🚀 Blockchain and quantum health status
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <motion.div 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-lime-500/20 rounded-2xl border border-green-400/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="w-4 h-4 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="font-bold text-white">Stacks Connection</span>
                  </div>
                  <span className="text-green-400 font-black">CONNECTED</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/20 to-lime-500/20 rounded-2xl border border-green-400/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="w-4 h-4 bg-green-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    />
                    <span className="font-bold text-white">Smart Contract Matrix</span>
                  </div>
                  <span className="text-green-400 font-black">ACTIVE</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/20 to-teal-500/20 rounded-2xl border border-blue-400/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="w-4 h-4 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                    />
                    <span className="font-bold text-white">Quantum Encryption</span>
                  </div>
                  <span className="text-blue-400 font-black">256-BIT AES</span>
                </motion.div>

                <motion.div
                  className="mt-6 text-center"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Button className="medistacks-btn-primary medistacks-btn-md animate-pulse-glow">
                    <Zap className="h-5 w-5 mr-2 animate-dna-spin" />
                    Run Diagnostics
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Dashboard
