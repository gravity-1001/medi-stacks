import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useStacks } from '@/contexts/StacksContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Stethoscope, Wallet, Shield, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const Login = () => {
  const { isSignedIn, connectWallet } = useStacks()
  const { userExists } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isSignedIn) {
      if (!userExists) navigate('/onboarding')
      else navigate('/app')
    }
  }, [isSignedIn, userExists, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8EB] via-[#F3F8F7] to-[#F9F8EB] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-[#A7D7C5]/20 rounded-full blur-xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-24 h-24 bg-[#74B49B]/20 rounded-full blur-lg"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-48 h-48 bg-[#5C8D89]/10 rounded-full blur-xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-[#1A3C40] hover:text-[#2D4B43] transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gradient-to-br from-[#A7D7C5] to-[#74B49B] rounded-full shadow-lg">
                <Stethoscope className="h-8 w-8 text-[#F9F8EB] animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black text-[#1A3C40] mt-4">
              Welcome to MediStacks
            </CardTitle>
            <CardDescription className="text-[#2D4B43]">
              Connect your Stacks wallet to access your secure medical records
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-[#F9F8EB] rounded-lg border border-[#1A3C40]/10 hover:border-[#1A3C40]/20 transition-all duration-300">
                <Shield className="h-5 w-5 text-[#2D4B43]" />
                <div>
                  <p className="font-medium text-[#1A3C40]">Secure & Private</p>
                  <p className="text-sm text-[#2D4B43]">Your data is encrypted and stored on blockchain</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-[#F9F8EB] rounded-lg border border-[#1A3C40]/10 hover:border-[#1A3C40]/20 transition-all duration-300">
                <Wallet className="h-5 w-5 text-[#2D4B43]" />
                <div>
                  <p className="font-medium text-[#1A3C40]">Wallet Required</p>
                  <p className="text-sm text-[#2D4B43]">Connect Hiro Wallet or Xverse to continue</p>
                </div>
              </div>
            </div>

            <Button
              onClick={connectWallet}
              className="w-full bg-[#1A3C40] hover:bg-[#2D4B43] text-[#F9F8EB] py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-lg font-medium"
            >
              <Wallet className="h-5 w-5 mr-2" />
              Connect Stacks Wallet
            </Button>

            <div className="text-center">
              <p className="text-xs text-[#2D4B43]/70">
                By connecting your wallet, you agree to our terms of service and privacy policy
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#2D4B43]">
            Don't have a Stacks wallet?{' '}
            <a
              href="https://wallet.hiro.so/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1A3C40] hover:text-[#2D4B43] font-medium transition-colors"
            >
              Get Hiro Wallet
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
