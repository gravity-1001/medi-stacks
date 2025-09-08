import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Spline from '@splinetool/react-spline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import MedicalLogo from '@/components/MedicalLogo'
import { Shield, Users, Activity, ArrowRight, Zap } from 'lucide-react'

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <div className="bg-[#5C8D89] py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Spline scene="https://prod.spline.design/9JVUYDs6eGGu8qMc/scene.splinecode" />
        </div>
        <div className="min-h-[60vh] flex items-center justify-center relative z-10">
          <div className="max-w-7xl w-full flex flex-col items-center space-y-12 text-center">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black text-[#F9F8EB]">
                MEDISTACKS
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-[#F9F8EB] max-w-4xl mx-auto leading-relaxed">
                Revolutionary Medical Records on Stacks Blockchain
              </p>
              <p className="text-lg md:text-xl text-[#F9F8EB] max-w-3xl mx-auto font-medium">
                Secure, decentralized, and patient-controlled healthcare data management
              </p>
              <Button 
                size="lg" 
                className="bg-[#F9F8EB] text-[#5C8D89] hover:bg-[#1A3C40] hover:text-[#F9F8EB] text-2xl px-12 py-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                onClick={() => navigate('/login')}
              >
                Join MediStacks
                <ArrowRight className="h-8 w-8 ml-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#F9F8EB] py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <Card className="bg-white/30 border border-[#5C8D89]/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Shield className="h-8 w-8 text-[#5C8D89]" />
                <CardTitle>Secure & Private</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#2D4B43]">
                Your medical data is encrypted and stored on the blockchain, giving you complete control over who can access it.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/30 border border-[#5C8D89]/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Users className="h-8 w-8 text-[#5C8D89]" />
                <CardTitle>Seamless Sharing</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#2D4B43]">
                Grant and revoke access to healthcare providers instantly through smart contracts.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/30 border border-[#5C8D89]/20 shadow-lg">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Activity className="h-8 w-8 text-[#5C8D89]" />
                <CardTitle>Real-time Access</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#2D4B43]">
                Access your medical records anytime, anywhere, with complete transparency.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-[#F9F8EB] py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-50">
          <Spline scene="https://prod.spline.design/vppA5Rc1czQCVv4z/scene.splinecode" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-[#5C8D89] text-center mb-16">
            How MediStacks Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12  bg-white/30 p-8 rounded-2xl shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#5C8D89] rounded-full flex items-center justify-center text-[#F9F8EB] text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-[#5C8D89] mb-4">Create Your Account</h3>
              <p className="text-[#2D4B43]">
                Sign up as a patient, doctor, or researcher. Your identity is verified and secured on the blockchain.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#5C8D89] rounded-full flex items-center justify-center text-[#F9F8EB] text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-[#5C8D89] mb-4">Manage Records</h3>
              <p className="text-[#2D4B43]">
                Upload and manage your medical records with military-grade encryption. Control access permissions.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-[#5C8D89] rounded-full flex items-center justify-center text-[#F9F8EB] text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-[#5C8D89] mb-4">Collaborate Securely</h3>
              <p className="text-[#2D4B43]">
                Share records with healthcare providers, participate in research, and earn rewards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose MediStacks Section */}
      <div className="bg-[#5C8D89] py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <div className="w-full h-full min-h-[600px]">
            <Spline scene="https://prod.spline.design/O-DQKT2zixEpH5uT/scene.splinecode" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-[#F9F8EB] text-center mb-16">
            Why Choose MediStacks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 ">
            <Card className="bg-white/90  border-none shadow-xl bg-white/30">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#A7D7C5] flex items-center justify-center">
                    <Shield className="h-6 w-6 text-[#5C8D89]" />
                  </div>
                  <CardTitle>Military-Grade Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-[#2D4B43]">
                  <li>• End-to-end encryption</li>
                  <li>• Blockchain-based access control</li>
                  <li>• HIPAA compliant storage</li>
                  <li>• Immutable audit trails</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/90 border-none shadow-xl bg-white/30">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#A7D7C5] flex items-center justify-center">
                    <Users className="h-6 w-6 text-[#5C8D89]" />
                  </div>
                  <CardTitle>Smart Collaboration</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-[#2D4B43]">
                  <li>• Instant access granting</li>
                  <li>• Role-based permissions</li>
                  <li>• Emergency access protocols</li>
                  <li>• Cross-institution sharing</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/90 border-none shadow-xl bg-white/30">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#A7D7C5] flex items-center justify-center">
                    <Activity className="h-6 w-6 text-[#5C8D89]" />
                  </div>
                  <CardTitle>Data Monetization</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-[#2D4B43]">
                  <li>• Earn STX tokens</li>
                  <li>• Research participation</li>
                  <li>• Anonymous data sharing</li>
                  <li>• Smart contract payouts</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#5C8D89] py-16 border-t border-[#A7D7C5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <MedicalLogo size="md" animated={false} />
            <span className="text-4xl font-black text-[#F9F8EB]">
              MediStacks
            </span>
          </div>
          <div className="flex items-center justify-center space-x-8 text-sm text-[#F9F8EB]">
            <span>Built on Stacks</span>
            <span>•</span>
            <span>Secured by Bitcoin</span>
            <span>•</span>
            <span>Patient-Controlled</span>
            <span>•</span>
            <span>HIPAA Compliant</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing
