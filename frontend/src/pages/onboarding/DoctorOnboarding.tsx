import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Stethoscope, Award, Building2, FileCheck, Shield, 
  ChevronRight, ChevronLeft, Upload
} from 'lucide-react'

interface DoctorProfile {
  fullName: string
  medicalLicenseNumber: string
  npiNumber: string
  deaNumber: string
  specialization: string
  subSpecialties: string[]
  yearsOfExperience: number
  boardCertifications: string[]
  hospitalAffiliations: string[]
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  clinicEmail: string
  licenseDocument: File | null
  malpracticeInsurance: File | null
  boardCertDocument: File | null
  typicalAccessDuration: number
  patientCategories: string[]
  hipaaCompliant: boolean
  ethicsTraining: boolean
  dataProtectionAgreement: boolean
  emergencyAccessProtocol: boolean
  consultationAvailability: 'always' | 'business-hours' | 'appointment-only'
  telemedicineEnabled: boolean
}

const DoctorOnboarding = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  
  const [profile, setProfile] = useState<DoctorProfile>({
    fullName: '',
    medicalLicenseNumber: '',
    npiNumber: '',
    deaNumber: '',
    specialization: '',
    subSpecialties: [],
    yearsOfExperience: 0,
    boardCertifications: [],
    hospitalAffiliations: [],
    clinicName: '',
    clinicAddress: '',
    clinicPhone: '',
    clinicEmail: '',
    licenseDocument: null,
    malpracticeInsurance: null,
    boardCertDocument: null,
    typicalAccessDuration: 7,
    patientCategories: [],
    hipaaCompliant: false,
    ethicsTraining: false,
    dataProtectionAgreement: false,
    emergencyAccessProtocol: false,
    consultationAvailability: 'business-hours',
    telemedicineEnabled: false
  })

  const specializations = [
    'General Practice', 'Internal Medicine', 'Pediatrics', 'Cardiology',
    'Neurology', 'Orthopedics', 'Psychiatry', 'Surgery', 'Emergency Medicine',
    'Radiology', 'Anesthesiology', 'Dermatology', 'Oncology', 'Other'
  ]

  const patientTypes = [
    'Pediatric', 'Adult', 'Geriatric', 'Prenatal', 'Chronic Care',
    'Acute Care', 'Emergency', 'Surgical', 'Mental Health'
  ]

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleFileUpload = (field: 'licenseDocument' | 'malpracticeInsurance' | 'boardCertDocument') => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfile({...profile, [field]: e.target.files[0]})
    }
  }


  const handleComplete = () => {
    localStorage.setItem('medistacks.onboarded', 'true')
    localStorage.setItem('medistacks.selectedRole', 'doctor')
    navigate('/app/doctor')
  }

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <Stethoscope className="h-12 w-12 text-[#5C8D89] mx-auto mb-4 animate-medical-float" />
              <h2 className="text-2xl font-bold text-[#1A3C40] mb-2">Professional Information</h2>
              <p className="text-[#2D4B43] text-lg">Let's verify your medical credentials</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-[#1A3C40] font-semibold mb-2 block">Full Name (as on medical license) *</Label>
                <Input
                  value={profile.fullName}
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  placeholder="Dr. John Smith"
                  className="bg-white border-[#5C8D89]/20 text-[#1A3C40] h-12 px-4"
                />
              </div>
              
              <div>
                <Label className="text-[#2D4B43] font-medium">Medical License Number *</Label>
                <Input
                  value={profile.medicalLicenseNumber}
                  onChange={(e) => setProfile({...profile, medicalLicenseNumber: e.target.value})}
                  placeholder="MD123456"
                  className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89]"
                />
              </div>
              
              <div>
                <Label className="text-[#2D4B43] font-medium">NPI Number *</Label>
                <Input
                  value={profile.npiNumber}
                  onChange={(e) => setProfile({...profile, npiNumber: e.target.value})}
                  placeholder="1234567890"
                  className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89]"
                />
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Award className="h-12 w-12 text-lime-400 mx-auto mb-3 animate-pulse" />
              <h2 className="text-[#5C8D89] font-medium">Specialization & Practice</h2>
              <p className="text-[#2D4B43] mt-2">Tell us about your medical specialization</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-[#2D4B43] font-medium">Primary Specialization *</Label>
                <Select value={profile.specialization} onValueChange={(v) => setProfile({...profile, specialization: v})}>
                  <SelectTrigger className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89]">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-lime-300 mb-3 block">Patient Categories</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {patientTypes.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        checked={profile.patientCategories.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setProfile({...profile, patientCategories: [...profile.patientCategories, type]})
                          } else {
                            setProfile({...profile, patientCategories: profile.patientCategories.filter(c => c !== type)})
                          }
                        }}
                        className="border-lime-400/50"
                      />
                      <Label className="text-[#333] cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 text-lime-400 mx-auto mb-3 animate-pulse" />
              <h2 className="text-[#5C8D89] font-medium">Practice Details</h2>
              <p className="text-[#333] mt-2">Information about your medical practice</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-[#333] font-medium">Clinic/Hospital Name *</Label>
                <Input
                  value={profile.clinicName}
                  onChange={(e) => setProfile({...profile, clinicName: e.target.value})}
                  placeholder="City Medical Center"
                  className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#333] font-medium">Clinic Phone</Label>
                  <Input
                    value={profile.clinicPhone}
                    onChange={(e) => setProfile({...profile, clinicPhone: e.target.value})}
                    placeholder="+1 234 567 8900"
                    className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89]"
                  />
                </div>
                
                <div>
                  <Label className="text-[#333] font-medium">Professional Email</Label>
                  <Input
                    type="email"
                    value={profile.clinicEmail}
                    onChange={(e) => setProfile({...profile, clinicEmail: e.target.value})}
                    placeholder="dr.smith@clinic.com"
                    className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <FileCheck className="h-12 w-12 text-lime-400 mx-auto mb-3 animate-pulse" />
              <h2 className="text-[#5C8D89] font-medium">Verification Documents</h2>
              <p className="text-[#333] mt-2">Upload your credentials for verification</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-lime-300 mb-2 block">Medical License *</Label>
                <div className="border-2 border-dashed border-[#74B49B]/30 rounded-lg p-6 text-center hover:border-[#5C8D89]/50 transition-colors">
                  <Upload className="h-8 w-8 text-lime-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={handleFileUpload('licenseDocument')}
                    className="hidden"
                    id="license-upload"
                  />
                  <label htmlFor="license-upload" className="cursor-pointer">
                    <p className="text-[#333]">
                      {profile.licenseDocument ? profile.licenseDocument.name : 'Click to upload medical license'}
                    </p>
                    <p className="text-xs text-[#333] mt-1">PDF, JPG or PNG (max 5MB)</p>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 text-lime-400 mx-auto mb-3 animate-pulse" />
              <h2 className="text-[#5C8D89] font-medium">Compliance & Agreements</h2>
              <p className="text-[#333] mt-2">Review and accept compliance requirements</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-[#333] font-semibold">Required Agreements</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={profile.hipaaCompliant}
                    onCheckedChange={(checked: boolean) => setProfile({...profile, hipaaCompliant: checked})}
                    className="mt-1"
                  />
                  <div>
                    <Label className="text-[#333] cursor-pointer">HIPAA Compliance Agreement</Label>
                    <p className="text-xs text-[#333] mt-1">
                      I confirm compliance with HIPAA regulations and will maintain patient privacy.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={profile.ethicsTraining}
                    onCheckedChange={(checked: boolean) => setProfile({...profile, ethicsTraining: checked})}
                    className="mt-1"
                  />
                  <div>
                    <Label className="text-[#333] cursor-pointer">Medical Ethics Certification</Label>
                    <p className="text-xs text-[#333] mt-1">
                      I have completed medical ethics training.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={profile.dataProtectionAgreement}
                    onCheckedChange={(checked: boolean) => setProfile({...profile, dataProtectionAgreement: checked})}
                    className="mt-1"
                  />
                  <div>
                    <Label className="text-[#333] cursor-pointer">Data Protection Agreement</Label>
                    <p className="text-xs text-[#333] mt-1">
                      I will protect patient data according to blockchain security protocols.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={profile.emergencyAccessProtocol}
                    onCheckedChange={(checked: boolean) => setProfile({...profile, emergencyAccessProtocol: checked})}
                    className="mt-1"
                  />
                  <div>
                    <Label className="text-[#333] cursor-pointer">Emergency Access Protocol</Label>
                    <p className="text-xs text-[#333] mt-1">
                      I understand emergency access procedures.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
    }
  }

  const stepTitles = ['Credentials', 'Specialization', 'Practice', 'Documents', 'Compliance']


  return (
    <div className="min-h-screen bg-[#F9F8EB] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <Card className="bg-white border-2 border-[#5C8D89]/20 shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-[#A7D7C5]/10 to-[#74B49B]/10 border-b border-[#5C8D89]/10">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-3xl font-black text-[#1A3C40]">Doctor Verification</CardTitle>
              <div className="flex items-center space-x-2">
                {stepTitles.map((_, index) => (
                  <div key={index} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      currentStep > index + 1 ? 'bg-[#5C8D89] text-[#F9F8EB]' :
                      currentStep === index + 1 ? 'bg-[#74B49B] text-[#F9F8EB] animate-pulse' :
                      'bg-[#A7D7C5]/30 text-[#5C8D89]'
                    }`}>
                      {index + 1}
                    </div>
                    {index < stepTitles.length - 1 && (
                      <div className={`w-8 h-0.5 transition-all ${
                        currentStep > index + 1 ? 'bg-[#5C8D89]' : 'bg-[#A7D7C5]/30'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <CardDescription className="text-[#2D4B43]">
              Step {currentStep} of 5: {stepTitles[currentStep - 1]}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {renderStep()}
            
            <div className="flex justify-between mt-8">
                <Button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="border-[#5C8D89]/20 text-[#1A3C40] hover:bg-[#5C8D89]/5 h-12 px-6 font-medium"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
                            <Button
                  onClick={currentStep === 5 ? handleComplete : handleNext}
                  disabled={currentStep === 5 && (!profile.hipaaCompliant || !profile.ethicsTraining || !profile.dataProtectionAgreement || !profile.emergencyAccessProtocol)}
                  className="bg-[#5C8D89] hover:bg-[#1A3C40] text-white h-12 px-8 font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === 5 ? (
                    'Complete Onboarding'
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DoctorOnboarding
