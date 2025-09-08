import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Building, Shield, Database, Search,
  ChevronRight, ChevronLeft, TrendingUp,
  Settings, FlaskConical
} from 'lucide-react'

interface ResearcherProfile {
  fullName: string
  orcidId: string
  institutionName: string
  institutionType: string
  department: string
  position: string
  researchAreas: string[]
  dataTypes: string[]
  sampleSizeRequired: string
  dataUsagePurpose: string
  anonymizationRequirements: string
  researchBudget: number
  maxPerRecordPrice: number
  irbApproved: boolean
  hipaaCompliant: boolean
  dataSecurityTraining: boolean
  publicationEthics: boolean
  willingToShareResults: boolean
}

const ResearcherOnboarding = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  
  const [profile, setProfile] = useState<ResearcherProfile>({
    fullName: '',
    orcidId: '',
    institutionName: '',
    institutionType: 'university',
    department: '',
    position: '',
    researchAreas: [],
    dataTypes: [],
    sampleSizeRequired: '',
    dataUsagePurpose: '',
    anonymizationRequirements: 'full',
    researchBudget: 0,
    maxPerRecordPrice: 0,
    irbApproved: false,
    hipaaCompliant: false,
    dataSecurityTraining: false,
    publicationEthics: false,
    willingToShareResults: false
  })

  const researchAreas = [
    'Oncology', 'Cardiology', 'Neurology', 'Infectious Diseases',
    'Genomics', 'Epidemiology', 'Public Health', 'Pharmacology',
    'Mental Health', 'Clinical Trials', 'AI/ML in Healthcare'
  ]

  const dataTypeOptions = [
    'Demographics', 'Medical History', 'Lab Results', 'Imaging Data',
    'Genomic Data', 'Treatment Outcomes', 'Medication Records'
  ]

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }


  const handleComplete = () => {
    localStorage.setItem('medistacks.onboarded', 'true')
    localStorage.setItem('medistacks.selectedRole', 'researcher')
    navigate('/app/researcher')
  }

  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Building className="h-12 w-12 text-[#5C8D89] mx-auto mb-4 animate-medical-float" />
              <h2 className="text-2xl font-bold text-[#1A3C40] mb-2">Institution & Identity</h2>
              <p className="text-[#2D4B43] text-lg">Tell us about your research institution</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-[#1A3C40] font-semibold mb-2 block">Full Name *</Label>
                <Input
                  value={profile.fullName}
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  placeholder="Dr. Jane Smith"
                  className="bg-white border-[#5C8D89]/20 text-[#1A3C40] h-12 px-4"
                />
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-semibold mb-2 block">ORCID ID</Label>
                <Input
                  value={profile.orcidId}
                  onChange={(e) => setProfile({...profile, orcidId: e.target.value})}
                  placeholder="0000-0000-0000-0000"
                  className="bg-white border-[#5C8D89]/20 text-[#1A3C40] h-12 px-4"
                />
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-semibold mb-2 block">Position/Title *</Label>
                <Input
                  value={profile.position}
                  onChange={(e) => setProfile({...profile, position: e.target.value})}
                  placeholder="Senior Research Scientist"
                  className="bg-white border-[#5C8D89]/20 text-[#1A3C40] h-12 px-4"
                />
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-semibold mb-2 block">Institution Name *</Label>
                <Input
                  value={profile.institutionName}
                  onChange={(e) => setProfile({...profile, institutionName: e.target.value})}
                  placeholder="Stanford University"
                  className="bg-white border-[#5C8D89]/20 text-[#1A3C40] h-12 px-4"
                />
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-semibold mb-2 block">Institution Type *</Label>
                <Select value={profile.institutionType} onValueChange={(v) => setProfile({...profile, institutionType: v})}>
                  <SelectTrigger className="bg-white border-[#5C8D89]/20 text-[#1A3C40] h-12 px-4">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="pharma">Pharmaceutical</SelectItem>
                    <SelectItem value="biotech">Biotech</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="non-profit">Non-Profit</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="text-[#2D4B43] font-medium text-center mb-6">
              <Database className="h-12 w-12 text-lime-400 mx-auto mb-3 animate-pulse" />
              <h2 className="text-sm font-medium text-[#2D4B43]">Data Requirements</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-[#1A3C40] font-semibold mb-4 block">Research Areas</Label>
                <div className="grid grid-cols-2 gap-4">
                  {researchAreas.map(area => (
                    <div key={area} className="flex items-center space-x-3">
                      <Checkbox
                        checked={profile.researchAreas.includes(area)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setProfile({...profile, researchAreas: [...profile.researchAreas, area]})
                          } else {
                            setProfile({...profile, researchAreas: profile.researchAreas.filter(a => a !== area)})
                          }
                        }}
                        className="h-5 w-5 border-[#5C8D89]/20 text-[#5C8D89]"
                      />
                      <Label className="text-[#2D4B43] cursor-pointer">{area}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-semibold mb-4 block">Data Types Needed</Label>
                <div className="grid grid-cols-2 gap-4">
                  {dataTypeOptions.map(type => (
                    <div key={type} className="flex items-center space-x-3">
                      <Checkbox
                        checked={profile.dataTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setProfile({...profile, dataTypes: [...profile.dataTypes, type]})
                          } else {
                            setProfile({...profile, dataTypes: profile.dataTypes.filter(t => t !== type)})
                          }
                        }}
                        className="h-5 w-5 border-[#5C8D89]/20 text-[#5C8D89]"
                      />
                      <Label className="text-[#2D4B43] cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-semibold mb-2 block">Sample Size Required</Label>
                <Input
                  value={profile.sampleSizeRequired}
                  onChange={(e) => setProfile({...profile, sampleSizeRequired: e.target.value})}
                  placeholder="1000-5000 patients"
                  className="bg-white border-[#5C8D89]/20 text-[#1A3C40] h-12 px-4"
                />
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
            <div className="text-[#2D4B43] font-medium text-center mb-6">
              <TrendingUp className="h-12 w-12 text-lime-400 mx-auto mb-3 animate-pulse" />
              <h2 className="text-sm font-medium text-[#2D4B43]">Budget & Ethics</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#2D4B43]">Research Budget (USD)</Label>
                  <Input
                    type="number"
                    value={profile.researchBudget}
                    onChange={(e) => setProfile({...profile, researchBudget: parseInt(e.target.value) || 0})}
                    placeholder="50000"
                    className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#2D4B43] h-12 px-4"
                  />
                </div>
                
                <div>
                  <Label className="text-[#2D4B43]">Max Price per Record (STX)</Label>
                  <Input
                    type="number"
                    value={profile.maxPerRecordPrice}
                    onChange={(e) => setProfile({...profile, maxPerRecordPrice: parseInt(e.target.value) || 0})}
                    placeholder="10"
                    className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#2D4B43] h-12 px-4"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-semibold mb-4 block">Anonymization Level</Label>
                <RadioGroup value={profile.anonymizationRequirements} onValueChange={(v) => setProfile({...profile, anonymizationRequirements: v})}>
                  <div className="flex items-center space-x-3 mb-3">
                    <RadioGroupItem value="full" className="h-5 w-5 border-[#5C8D89]/20 text-[#5C8D89]" />
                    <Label className="text-[#2D4B43]">Full - No identifiable information</Label>
                  </div>
                  <div className="flex items-center space-x-3 mb-3">
                    <RadioGroupItem value="partial" className="h-5 w-5 border-[#5C8D89]/20 text-[#5C8D89]" />
                    <Label className="text-[#2D4B43]">Partial - Age and region visible</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="minimal" className="h-5 w-5 border-[#5C8D89]/20 text-[#5C8D89]" />
                    <Label className="text-[#2D4B43]">Minimal - Demographics visible</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <Label className="text-[#1A3C40] font-semibold mb-2 block">Data Usage Purpose *</Label>
                <Textarea
                  value={profile.dataUsagePurpose}
                  onChange={(e) => setProfile({...profile, dataUsagePurpose: e.target.value})}
                  placeholder="Describe how you will use the data..."
                  className="bg-white border-[#5C8D89]/20 text-[#1A3C40] p-4"
                  rows={3}
                />
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
            <div className="text-[#2D4B43] font-medium text-center mb-6">
              <Shield className="h-12 w-12 text-lime-400 mx-auto mb-3 animate-pulse" />
              <h2 className="text-sm font-medium text-[#2D4B43]">Compliance</h2>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-[#2D4B43] font-semibold">Required Agreements</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={profile.irbApproved}
                    onCheckedChange={(checked: boolean) => setProfile({...profile, irbApproved: checked})}
                    className="mt-1"
                  />
                  <div>
                    <Label className="text-[#2D4B43]">IRB Approval</Label>
                    <p className="text-xs text-teal-300 mt-1">Research has IRB approval</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={profile.hipaaCompliant}
                    onCheckedChange={(checked: boolean) => setProfile({...profile, hipaaCompliant: checked})}
                    className="mt-1"
                  />
                  <div>
                    <Label className="text-[#2D4B43]">HIPAA Compliance</Label>
                    <p className="text-xs text-teal-300 mt-1">Will maintain HIPAA standards</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={profile.dataSecurityTraining}
                    onCheckedChange={(checked: boolean) => setProfile({...profile, dataSecurityTraining: checked})}
                    className="mt-1"
                  />
                  <div>
                    <Label className="text-[#2D4B43]">Data Security Training</Label>
                    <p className="text-xs text-teal-300 mt-1">Completed data security training</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={profile.publicationEthics}
                    onCheckedChange={(checked: boolean) => setProfile({...profile, publicationEthics: checked})}
                    className="mt-1"
                  />
                  <div>
                    <Label className="text-[#2D4B43]">Publication Ethics</Label>
                    <p className="text-xs text-teal-300 mt-1">Will follow publication ethics</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={profile.willingToShareResults}
                    onCheckedChange={(checked: boolean) => setProfile({...profile, willingToShareResults: checked})}
                    className="mt-1"
                  />
                  <div>
                    <Label className="text-[#2D4B43]">Share Results</Label>
                    <p className="text-xs text-teal-300 mt-1">Share findings with patients</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )
    }
  }

  const stepTitles = ['Institution', 'Research', 'Budget', 'Ethics']


  return (
    <div className="min-h-screen bg-[#F9F8EB] flex">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-[#F9F8EB]/80 via-white/70 to-[#F9F8EB]/80 backdrop-blur-lg border-r border-[#1A3C40]/10 min-h-screen shadow-lg">
        <div className="p-8 space-y-6">
          <div className="flex items-center space-x-3">
            <FlaskConical className="h-8 w-8 text-[#5C8D89]" />
            <h2 className="text-2xl font-bold text-[#1A3C40]">Researcher</h2>
          </div>
          
          <div className="space-y-4">
            <motion.button
              onClick={() => navigate('/app/research')}
              whileHover={{ scale: 1.05, x: 10 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 text-[#1A3C40] hover:bg-[#1A3C40]/5 hover:text-[#1A3C40] border border-transparent hover:border-[#1A3C40]/20"
            >
              <Search className="h-6 w-6 mr-4 text-[#2D4B43]" />
              <span className="tracking-wide">RESEARCH HUB</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/app/settings')}
              whileHover={{ scale: 1.05, x: 10 }}
              whileTap={{ scale: 0.95 }}
              className="w-full flex items-center px-6 py-4 text-base font-bold rounded-2xl transition-all duration-300 text-[#1A3C40] hover:bg-[#1A3C40]/5 hover:text-[#1A3C40] border border-transparent hover:border-[#1A3C40]/20"
            >
              <Settings className="h-6 w-6 mr-4 text-[#2D4B43]" />
              <span className="tracking-wide">SETTINGS</span>
            </motion.button>
          </div>

          <div className="mt-auto pt-8 text-center">
            <p className="text-[#1A3C40] text-sm font-medium">
              Stacks Network Active
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
        <Card className="bg-white border-2 border-[#5C8D89]/20 shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-[#A7D7C5]/10 to-[#74B49B]/10 border-b border-[#5C8D89]/10">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-3xl font-black text-[#1A3C40]">Researcher Onboarding</CardTitle>
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
              
              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  className="bg-[#5C8D89] hover:bg-[#1A3C40] text-white h-12 px-8 font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!profile.irbApproved || !profile.hipaaCompliant}
                  className="bg-[#5C8D89] hover:bg-[#1A3C40] text-white h-12 px-8 font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Verification
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResearcherOnboarding
