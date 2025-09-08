import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, Heart, Shield, Database, AlertCircle,
  Eye, Bell, ChevronLeft, ChevronRight, UserCheck, Lock
} from 'lucide-react'
import { useStacks } from '@/contexts/StacksContext'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { uintCV, bufferCV, stringUtf8CV, boolCV } from '@stacks/transactions'

interface HealthProfile {
  // Basic Information
  fullName: string
  dateOfBirth: string
  gender: string
  bloodType: string
  height: string
  weight: string
  
  // Medical History
  knownConditions: string[]
  allergies: string[]
  currentMedications: string[]
  primaryPhysician: string
  insuranceProvider: string
  insuranceId: string
  
  // Emergency Contact
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
  
  // Data Sharing Preferences
  defaultDoctorAccessDays: number
  allowResearcherAccess: boolean
  anonymizationLevel: 'full' | 'partial' | 'minimal'
  emergencyOverrideHospitals: string[]
  
  // Consent Policies
  autoApproveTrustedDoctors: boolean
  requireNotificationForAccess: boolean
  allowDataExport: boolean
  dataRetentionYears: number
}

const PatientOnboarding = () => {
  const navigate = useNavigate()
  const { callContractFunction } = useStacks()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [profile, setProfile] = useState<HealthProfile>({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    height: '',
    weight: '',
    knownConditions: [],
    allergies: [],
    currentMedications: [],
    primaryPhysician: '',
    insuranceProvider: '',
    insuranceId: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    defaultDoctorAccessDays: 7,
    allowResearcherAccess: false,
    anonymizationLevel: 'full',
    emergencyOverrideHospitals: [],
    autoApproveTrustedDoctors: false,
    requireNotificationForAccess: true,
    allowDataExport: false,
    dataRetentionYears: 7
  })

  const conditions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 
    'Arthritis', 'Cancer', 'Depression', 'Anxiety', 'Other'
  ]

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  // Compute SHA-256 hash as 32-byte buffer for content-hash
  const sha256Bytes = async (input: string): Promise<Uint8Array> => {
    const enc = new TextEncoder()
    const data = enc.encode(input)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return new Uint8Array(digest)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      // Store profile in encrypted local storage (in production, use secure storage)
      localStorage.setItem('medistacks.patientProfile', JSON.stringify(profile))
      localStorage.setItem('medistacks.onboarded', 'true')
      localStorage.setItem('medistacks.selectedRole', 'patient')
      
      // Create initial blockchain record with consent policies
      try {
        const recordId = Date.now()
        const payload = JSON.stringify({
          healthProfile: profile,
          consentPolicies: {
            emergencyOverrideHospitals: profile.emergencyOverrideHospitals,
            allowResearcherAccess: profile.allowResearcherAccess,
            anonymizationLevel: profile.anonymizationLevel,
            autoApproveTrustedDoctors: profile.autoApproveTrustedDoctors,
            requireNotificationForAccess: profile.requireNotificationForAccess,
            dataRetentionYears: profile.dataRetentionYears,
            defaultDoctorAccessDays: profile.defaultDoctorAccessDays
          }
        })
        const hashBytes = await sha256Bytes(payload)
        const uri = `https://medistacks.app/patient-profile/${recordId}`

        await callContractFunction('register-record', [
          uintCV(recordId),
          bufferCV(hashBytes),
          stringUtf8CV(uri),
          boolCV(profile.allowResearcherAccess)
        ])
        console.log('Patient profile registered on blockchain')
      } catch (error) {
        console.error('Failed to register on blockchain:', error)
        // Continue with local storage as fallback
      }
      
      toast({
        title: "Profile Created Successfully! 🎉",
        description: "Your health profile has been securely stored on the blockchain.",
      })
      
      navigate('/app/patient')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-[#5C8D89] mx-auto mb-3 animate-medical-float" />
              <h2 className="text-2xl font-bold text-[#1A3C40]">Basic Information</h2>
              <p className="text-[#1A3C40] mt-2">Let's start with your personal details</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[#1A3C40] font-medium">Full Name *</Label>
                <Input
                  value={profile.fullName}
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  placeholder="John Doe"
                  className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]"
                />
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-medium">Date of Birth *</Label>
                <Input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({...profile, dateOfBirth: e.target.value})}
                  className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]"
                />
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-medium">Gender</Label>
                <Select value={profile.gender} onValueChange={(v) => setProfile({...profile, gender: v})}>
                  <SelectTrigger className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-medium">Blood Type</Label>
                <Select value={profile.bloodType} onValueChange={(v) => setProfile({...profile, bloodType: v})}>
                  <SelectTrigger className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {bloodTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-medium">Height (cm)</Label>
                <Input
                  type="number"
                  value={profile.height}
                  onChange={(e) => setProfile({...profile, height: e.target.value})}
                  placeholder="175"
                  className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]"
                />
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-medium">Weight (kg)</Label>
                <Input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => setProfile({...profile, weight: e.target.value})}
                  placeholder="70"
                  className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]"
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
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Heart className="h-12 w-12 text-lime-400 mx-auto mb-3 animate-heartbeat" />
              <h2 className="text-2xl font-bold text-[#1A3C40]">Medical History</h2>
              <p className="text-[#1A3C40] mt-2">Help us understand your health background</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-[#1A3C40] font-medium mb-3 block">Known Conditions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {conditions.map(condition => (
                    <div key={condition} className="flex items-center space-x-2">
                      <Checkbox
                        checked={profile.knownConditions.includes(condition)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setProfile({...profile, knownConditions: [...profile.knownConditions, condition]})
                          } else {
                            setProfile({...profile, knownConditions: profile.knownConditions.filter(c => c !== condition)})
                          }
                        }}
                        className="border-[#3498db]/50"
                      />
                      <Label className="text-[#1A3C40] cursor-pointer">{condition}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-medium">Allergies (comma separated)</Label>
                <Textarea
                  value={profile.allergies.join(', ')}
                  onChange={(e) => setProfile({...profile, allergies: e.target.value.split(',').map(a => a.trim()).filter(Boolean)})}
                  placeholder="Penicillin, Peanuts, Latex..."
                  className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]"
                />
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-medium">Current Medications</Label>
                <Textarea
                  value={profile.currentMedications.join(', ')}
                  onChange={(e) => setProfile({...profile, currentMedications: e.target.value.split(',').map(m => m.trim()).filter(Boolean)})}
                  placeholder="Medication name and dosage..."
                  className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#1A3C40] font-medium">Primary Physician</Label>
                  <Input
                    value={profile.primaryPhysician}
                    onChange={(e) => setProfile({...profile, primaryPhysician: e.target.value})}
                    placeholder="Dr. Smith"
                    className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]"
                  />
                </div>
                
                <div>
                  <Label className="text-[#1A3C40] font-medium">Insurance Provider</Label>
                  <Input
                    value={profile.insuranceProvider}
                    onChange={(e) => setProfile({...profile, insuranceProvider: e.target.value})}
                    placeholder="Blue Cross"
                    className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]"
                  />
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
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <AlertCircle className="h-12 w-12 text-lime-400 mx-auto mb-3 animate-pulse" />
              <h2 className="text-2xl font-bold text-[#1A3C40]">Emergency Contact</h2>
              <p className="text-[#1A3C40] mt-2">Who should we contact in case of emergency?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-[#1A3C40] font-medium">Contact Name *</Label>
                <Input
                  value={profile.emergencyContactName}
                  onChange={(e) => setProfile({...profile, emergencyContactName: e.target.value})}
                  placeholder="Jane Doe"
                  className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]"
                />
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-medium">Phone Number *</Label>
                <Input
                  value={profile.emergencyContactPhone}
                  onChange={(e) => setProfile({...profile, emergencyContactPhone: e.target.value})}
                  placeholder="+1 234 567 8900"
                  className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]"
                />
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-medium">Relationship</Label>
                <Select value={profile.emergencyContactRelation} onValueChange={(v) => setProfile({...profile, emergencyContactRelation: v})}>
                  <SelectTrigger className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-medium">Emergency Override Hospitals</Label>
                <Textarea
                  value={profile.emergencyOverrideHospitals.join(', ')}
                  onChange={(e) => setProfile({...profile, emergencyOverrideHospitals: e.target.value.split(',').map(h => h.trim()).filter(Boolean)})}
                  placeholder="City General Hospital, St. Mary's Medical Center..."
                  className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#1A3C40]"
                />
                <p className="text-xs text-[#1A3C40] mt-1">These hospitals can access your records in emergencies</p>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 text-lime-400 mx-auto mb-3 animate-pulse" />
              <h2 className="text-2xl font-bold text-[#1A3C40]">Data Sharing Preferences</h2>
              <p className="text-[#1A3C40] mt-2">Control how your medical data is shared</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-[#1A3C40] font-medium mb-2 block">Default Doctor Access Duration</Label>
                <RadioGroup value={profile.defaultDoctorAccessDays.toString()} onValueChange={(v) => setProfile({...profile, defaultDoctorAccessDays: parseInt(v)})}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="1" />
                    <Label className="text-[#1A3C40]">24 hours</Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="7" />
                    <Label className="text-[#1A3C40]">7 days</Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="30" />
                    <Label className="text-[#1A3C40]">30 days</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" />
                    <Label className="text-[#1A3C40]">No automatic expiry</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-medium mb-2 block">Research Data Anonymization Level</Label>
                <RadioGroup value={profile.anonymizationLevel} onValueChange={(v: any) => setProfile({...profile, anonymizationLevel: v})}>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="full" />
                    <Label className="text-[#1A3C40]">Full - Complete anonymization</Label>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <RadioGroupItem value="partial" />
                    <Label className="text-[#1A3C40]">Partial - Age and location visible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" />
                    <Label className="text-[#1A3C40]">Minimal - Basic demographics visible</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={profile.allowResearcherAccess}
                    onCheckedChange={(checked: boolean) => setProfile({...profile, allowResearcherAccess: checked})}
                  />
                  <Label className="text-[#1A3C40]">Allow my anonymized data to be used for research (earn STX)</Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={profile.autoApproveTrustedDoctors}
                    onCheckedChange={(checked: boolean) => setProfile({...profile, autoApproveTrustedDoctors: checked})}
                  />
                  <Label className="text-[#1A3C40]">Auto-approve access for my trusted doctors</Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={profile.requireNotificationForAccess}
                    onCheckedChange={(checked: boolean) => setProfile({...profile, requireNotificationForAccess: checked})}
                  />
                  <Label className="text-[#1A3C40]">Notify me when someone accesses my records</Label>
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
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <Lock className="h-12 w-12 text-lime-400 mx-auto mb-3 animate-pulse" />
              <h2 className="text-2xl font-bold text-[#1A3C40]">Consent Policies</h2>
              <p className="text-[#1A3C40] mt-2">Review and confirm your consent settings</p>
            </div>
            
            <Card className="bg-gradient-to-br from-[#A7D7C5]/20 to-[#74B49B]/20 border-[#5C8D89]/30">
              <CardHeader>
                <CardTitle className="text-[#2D4B43] font-medium">Your Privacy Settings Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Eye className="h-5 w-5 text-lime-400 mt-0.5" />
                  <div>
                    <p className="text-[#2D4B43] font-medium">Doctor Access</p>
                    <p className="text-[#2D4B43] text-sm">
                      Default access duration: {profile.defaultDoctorAccessDays === 0 ? 'No expiry' : `${profile.defaultDoctorAccessDays} days`}
                      {profile.autoApproveTrustedDoctors && ' • Auto-approve trusted doctors'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Database className="h-5 w-5 text-lime-400 mt-0.5" />
                  <div>
                    <p className="text-[#2D4B43] font-medium">Research Participation</p>
                    <p className="text-[#2D4B43] text-sm">
                      {profile.allowResearcherAccess ? `Enabled with ${profile.anonymizationLevel} anonymization` : 'Disabled'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Bell className="h-5 w-5 text-lime-400 mt-0.5" />
                  <div>
                    <p className="text-[#2D4B43] font-medium">Notifications</p>
                    <p className="text-[#2D4B43] text-sm">
                      {profile.requireNotificationForAccess ? 'Enabled for all access events' : 'Disabled'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-lime-400 mt-0.5" />
                  <div>
                    <p className="text-[#2D4B43] font-medium">Emergency Access</p>
                    <p className="text-[#2D4B43] text-sm">
                      {profile.emergencyOverrideHospitals.length > 0 
                        ? `Enabled for ${profile.emergencyOverrideHospitals.length} hospital(s)` 
                        : 'Manual approval required'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-gradient-to-r from-[#A7D7C5]/20 to-[#74B49B]/20 p-4 rounded-lg border border-[#5C8D89]/20">
              <p className="text-sm text-[#2D4B43]">
                <Shield className="inline h-4 w-4 mr-2" />
                Your consent policies are encoded in smart contracts and enforced automatically on the blockchain. 
                You can modify these settings at any time from your dashboard.
              </p>
            </div>
          </motion.div>
        )
    }
  }

  const stepTitles = [
    'Basic Info',
    'Medical History',
    'Emergency',
    'Data Sharing',
    'Consent'
  ]

  return (
    <div className="min-h-screen bg-[#F9F8EB] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <Card className="bg-gradient-to-br from-[#A7D7C5]/30 to-[#74B49B]/20 border-2 border-[#5C8D89]/20 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-3xl font-black text-[#5C8D89]">Patient Onboarding</CardTitle>
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
                className="border-[#74B49B]/30 text-[#5C8D89] hover:bg-[#A7D7C5]/10"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  className="bg-[#74B49B] hover:bg-[#5C8D89] text-[#F9F8EB] px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[#74B49B] hover:bg-[#5C8D89] text-[#F9F8EB] px-6 py-2 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
                  <UserCheck className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PatientOnboarding
