import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Stethoscope, FlaskConical, UserRound, ArrowLeft, Shield } from 'lucide-react'
import { useStacks } from '@/contexts/StacksContext'
import { motion } from 'framer-motion'

const roles = [
  { key: 'patient', title: 'Patient', desc: 'Own your medical data, control access, and earn from research participation', icon: UserRound },
  { key: 'doctor', title: 'Healthcare Provider', desc: 'Request patient records, manage access permissions, and provide care', icon: Stethoscope },
  { key: 'researcher', title: 'Medical Researcher', desc: 'Access anonymized datasets for research with STX payments', icon: FlaskConical },
] as const

type RoleKey = typeof roles[number]['key']

const Onboarding = () => {
  const navigate = useNavigate()
  const { isSignedIn } = useStacks()
  const [selected, setSelected] = useState<RoleKey | null>(null)

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/login')
    }
  }, [isSignedIn, navigate])

  const proceed = () => {
    if (!selected) return
    // Navigate to role-specific onboarding
    if (selected === 'doctor') navigate('/onboarding/doctor')
    else if (selected === 'researcher') navigate('/onboarding/researcher')
    else navigate('/onboarding/patient')
  }

  return (
    <div className="min-h-screen bg-[#F9F8EB] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 text-[#5C8D89] hover:text-[#74B49B]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="bg-gradient-to-br from-[#A7D7C5]/30 to-[#74B49B]/20 border-2 border-[#5C8D89]/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-black text-[#5C8D89]">Welcome to MediStacks</CardTitle>
            <CardDescription className="text-[#74B49B] font-medium text-lg">
              Select your role to begin the onboarding process. Each role has specific requirements and verification steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((r) => (
                <motion.button
                  key={r.key}
                  onClick={() => setSelected(r.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group text-left rounded-2xl border-2 transition-all duration-300 p-6 bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/30 hover:to-[#74B49B]/40 ${selected === r.key ? 'border-[#5C8D89] shadow-lg transform scale-105' : 'border-[#74B49B]/30'}`}
                >
                  <div className="flex items-center mb-4">
                    <r.icon className="h-8 w-8 text-[#5C8D89] mr-3 group-hover:animate-medical-float" />
                    <span className="text-xl font-bold text-[#5C8D89]">{r.title}</span>
                  </div>
                  <p className="text-[#74B49B] text-sm leading-relaxed">{r.desc}</p>
                  {selected === r.key && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 text-xs text-[#5C8D89] font-medium"
                    >
                      ✓ Selected - Click continue to proceed
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start space-x-3 text-[#74B49B]">
                <Shield className="h-5 w-5 mt-0.5 text-[#5C8D89]" />
                <div className="text-sm">
                  <p className="font-medium text-[#5C8D89] mb-1">Next Steps:</p>
                  <ul className="space-y-1">
                    <li>• <span className="font-medium">Patients:</span> Create health profile, set privacy preferences, configure consent policies</li>
                    <li>• <span className="font-medium">Doctors:</span> Verify credentials, upload licenses, complete compliance requirements</li>
                    <li>• <span className="font-medium">Researchers:</span> Submit institution details, IRB approval, define data requirements</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button onClick={proceed} className="bg-[#74B49B] hover:bg-[#5C8D89] text-[#F9F8EB] px-8 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" disabled={!selected}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Onboarding
