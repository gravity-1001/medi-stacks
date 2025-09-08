import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, Plus, Edit, Trash2, Clock, Users, Database, 
  AlertCircle, CheckCircle, Save
} from 'lucide-react'
import { useStacks } from '@/contexts/StacksContext'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { uintCV, bufferCV, stringUtf8CV, boolCV } from '@stacks/transactions'

interface ConsentPolicy {
  id: string
  name: string
  description: string
  dataTypes: string[]
  allowedRoles: string[]
  accessDuration: number // in days, 0 = permanent
  autoApprove: boolean
  requireNotification: boolean
  emergencyOverride: boolean
  researchParticipation: boolean
  anonymizationLevel: 'full' | 'partial' | 'minimal'
  restrictions: string[]
  createdAt: Date
  isActive: boolean
}

const ConsentPolicies = () => {
  const { callContractFunction } = useStacks()
  const { toast } = useToast()
  const [policies, setPolicies] = useState<ConsentPolicy[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState<ConsentPolicy | null>(null)
  const [newPolicy, setNewPolicy] = useState<Partial<ConsentPolicy>>({
    name: '',
    description: '',
    dataTypes: [],
    allowedRoles: [],
    accessDuration: 7,
    autoApprove: false,
    requireNotification: true,
    emergencyOverride: true,
    researchParticipation: false,
    anonymizationLevel: 'full',
    restrictions: [],
    isActive: true
  })

  const dataTypeOptions = [
    'Basic Demographics', 'Medical History', 'Current Medications', 
    'Lab Results', 'Imaging Data', 'Vital Signs', 'Allergies',
    'Treatment Plans', 'Progress Notes', 'Surgical Records'
  ]

  const roleOptions = [
    { value: 'primary-care', label: 'Primary Care Physician' },
    { value: 'specialist', label: 'Medical Specialists' },
    { value: 'emergency', label: 'Emergency Responders' },
    { value: 'researcher', label: 'Medical Researchers' },
    { value: 'pharmacist', label: 'Pharmacists' },
    { value: 'nurse', label: 'Nurses' }
  ]

  useEffect(() => {
    loadPolicies()
  }, [])

  const loadPolicies = () => {
    // Load from localStorage for now, in production would load from blockchain
    const stored = localStorage.getItem('medistacks.consentPolicies')
    if (stored) {
      setPolicies(JSON.parse(stored).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      })))
    } else {
      // Create default policies
      const defaultPolicies: ConsentPolicy[] = [
        {
          id: '1',
          name: 'Primary Care Access',
          description: 'Standard access for my primary care physician',
          dataTypes: ['Basic Demographics', 'Medical History', 'Current Medications', 'Lab Results'],
          allowedRoles: ['primary-care'],
          accessDuration: 0, // permanent
          autoApprove: true,
          requireNotification: false,
          emergencyOverride: true,
          researchParticipation: false,
          anonymizationLevel: 'minimal',
          restrictions: [],
          createdAt: new Date(),
          isActive: true
        },
        {
          id: '2',
          name: 'Emergency Access',
          description: 'Critical access for emergency situations',
          dataTypes: ['Basic Demographics', 'Medical History', 'Allergies', 'Current Medications'],
          allowedRoles: ['emergency'],
          accessDuration: 1,
          autoApprove: true,
          requireNotification: true,
          emergencyOverride: true,
          researchParticipation: false,
          anonymizationLevel: 'minimal',
          restrictions: ['Emergency situations only'],
          createdAt: new Date(),
          isActive: true
        }
      ]
      setPolicies(defaultPolicies)
      localStorage.setItem('medistacks.consentPolicies', JSON.stringify(defaultPolicies))
    }
  }

  const sha256Bytes = async (input: string): Promise<Uint8Array> => {
    const data = new TextEncoder().encode(input)
    const digest = await crypto.subtle.digest('SHA-256', data)
    return new Uint8Array(digest)
  }

  const savePolicy = async () => {
    if (!newPolicy.name || !newPolicy.description) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and description for the policy.",
        variant: "destructive"
      })
      return
    }

    const policy: ConsentPolicy = {
      id: editingPolicy?.id || Date.now().toString(),
      name: newPolicy.name!,
      description: newPolicy.description!,
      dataTypes: newPolicy.dataTypes || [],
      allowedRoles: newPolicy.allowedRoles || [],
      accessDuration: newPolicy.accessDuration || 7,
      autoApprove: newPolicy.autoApprove || false,
      requireNotification: newPolicy.requireNotification || true,
      emergencyOverride: newPolicy.emergencyOverride || true,
      researchParticipation: newPolicy.researchParticipation || false,
      anonymizationLevel: newPolicy.anonymizationLevel || 'full',
      restrictions: newPolicy.restrictions || [],
      createdAt: editingPolicy?.createdAt || new Date(),
      isActive: newPolicy.isActive !== false
    }

    let updatedPolicies
    if (editingPolicy) {
      updatedPolicies = policies.map(p => p.id === editingPolicy.id ? policy : p)
    } else {
      updatedPolicies = [...policies, policy]
    }

    setPolicies(updatedPolicies)
    localStorage.setItem('medistacks.consentPolicies', JSON.stringify(updatedPolicies))

    // Save consent policy to blockchain
    try {
      const recordId = Date.now()
      const payload = JSON.stringify(policy)
      const hash = await sha256Bytes(payload)
      const uri = `https://medistacks.app/consent-policy/${recordId}`
      await callContractFunction('register-record', [
        uintCV(recordId),
        bufferCV(hash),
        stringUtf8CV(uri),
        boolCV(policy.researchParticipation)
      ])
      console.log('Consent policy saved to blockchain')
    } catch (error) {
      console.error('Failed to save policy to blockchain:', error)
    }

    toast({
      title: editingPolicy ? "Policy Updated" : "Policy Created",
      description: `Consent policy "${policy.name}" has been ${editingPolicy ? 'updated' : 'created'} successfully.`,
    })

    resetForm()
  }

  const deletePolicy = async (policyId: string) => {
    const updatedPolicies = policies.filter(p => p.id !== policyId)
    setPolicies(updatedPolicies)
    localStorage.setItem('medistacks.consentPolicies', JSON.stringify(updatedPolicies))

    toast({
      title: "Policy Deleted",
      description: "Consent policy has been removed.",
    })
  }

  const togglePolicyStatus = async (policyId: string) => {
    const updatedPolicies = policies.map(p => 
      p.id === policyId ? { ...p, isActive: !p.isActive } : p
    )
    setPolicies(updatedPolicies)
    localStorage.setItem('medistacks.consentPolicies', JSON.stringify(updatedPolicies))
  }

  const resetForm = () => {
    setNewPolicy({
      name: '',
      description: '',
      dataTypes: [],
      allowedRoles: [],
      accessDuration: 7,
      autoApprove: false,
      requireNotification: true,
      emergencyOverride: true,
      researchParticipation: false,
      anonymizationLevel: 'full',
      restrictions: [],
      isActive: true
    })
    setIsCreating(false)
    setEditingPolicy(null)
  }

  const startEdit = (policy: ConsentPolicy) => {
    setEditingPolicy(policy)
    setNewPolicy(policy)
    setIsCreating(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8EB] via-[#F3F8F7] to-[#F9F8EB] p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3C40]">Consent Policies</h1>
          <p className="text-[#2D4B43] mt-2">
            Manage how your medical data can be accessed and by whom
          </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="medistacks-btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>

      {/* Policy Creation/Edit Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="shimmer-card">
            <CardHeader>
              <CardTitle className="text-[#1A3C40] font-bold">
                {editingPolicy ? 'Edit Policy' : 'Create New Consent Policy'}
              </CardTitle>
              <CardDescription className="text-[#2D4B43]">
                Define who can access your data and under what conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#1A3C40] font-medium">Policy Name *</Label>
                  <Input
                    value={newPolicy.name}
                    onChange={(e) => setNewPolicy({...newPolicy, name: e.target.value})}
                    placeholder="e.g., Specialist Consultation"
                    className="border-[#5C8D89]/20 text-[#1A3C40]"
                  />
                </div>
                
                <div>
                  <Label className="text-[#1A3C40] font-medium">Access Duration</Label>
                  <Select 
                    value={newPolicy.accessDuration?.toString()} 
                    onValueChange={(v) => setNewPolicy({...newPolicy, accessDuration: parseInt(v)})}
                  >
                    <SelectTrigger className="border-[#5C8D89]/20 text-[#1A3C40]">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">24 hours</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="0">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-[#1A3C40] font-medium">Description</Label>
                <Textarea
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy({...newPolicy, description: e.target.value})}
                  placeholder="Describe when and why this policy should be used..."
                  className="border-[#5C8D89]/20 text-[#1A3C40]"
                />
              </div>

              <div>
                <Label className="text-[#1A3C40] font-medium mb-3 block">Data Types Included</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dataTypeOptions.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        checked={newPolicy.dataTypes?.includes(type)}
                        onCheckedChange={(checked) => {
                          const current = newPolicy.dataTypes || []
                          if (checked) {
                            setNewPolicy({...newPolicy, dataTypes: [...current, type]})
                          } else {
                            setNewPolicy({...newPolicy, dataTypes: current.filter(t => t !== type)})
                          }
                        }}
                        className="border-lime-400/50"
                      />
                      <Label className="text-[#2D4B43] cursor-pointer text-sm">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-[#1A3C40] font-medium mb-3 block">Allowed Roles</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map(role => (
                    <div key={role.value} className="flex items-center space-x-2">
                      <Checkbox
                        checked={newPolicy.allowedRoles?.includes(role.value)}
                        onCheckedChange={(checked) => {
                          const current = newPolicy.allowedRoles || []
                          if (checked) {
                            setNewPolicy({...newPolicy, allowedRoles: [...current, role.value]})
                          } else {
                            setNewPolicy({...newPolicy, allowedRoles: current.filter(r => r !== role.value)})
                          }
                        }}
                        className="border-lime-400/50"
                      />
                      <Label className="text-[#2D4B43] cursor-pointer text-sm">{role.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-[#1A3C40] font-medium mb-2 block">Research Data Anonymization</Label>
                <RadioGroup 
                  value={newPolicy.anonymizationLevel} 
                  onValueChange={(v: any) => setNewPolicy({...newPolicy, anonymizationLevel: v})}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="full" />
                    <Label className="text-[#2D4B43]">Full - Complete anonymization</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partial" />
                    <Label className="text-[#2D4B43]">Partial - Age and location visible</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" />
                    <Label className="text-[#2D4B43]">Minimal - Basic demographics visible</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <h4 className="text-[#1A3C40] font-medium">Policy Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={newPolicy.autoApprove}
                      onCheckedChange={(checked: boolean) => setNewPolicy({...newPolicy, autoApprove: checked})}
                    />
                    <Label className="text-[#2D4B43]">Auto-approve matching requests</Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={newPolicy.requireNotification}
                      onCheckedChange={(checked: boolean) => setNewPolicy({...newPolicy, requireNotification: checked})}
                    />
                    <Label className="text-[#2D4B43]">Notify me when accessed</Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={newPolicy.emergencyOverride}
                      onCheckedChange={(checked: boolean) => setNewPolicy({...newPolicy, emergencyOverride: checked})}
                    />
                    <Label className="text-[#2D4B43]">Allow emergency override</Label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={newPolicy.researchParticipation}
                      onCheckedChange={(checked: boolean) => setNewPolicy({...newPolicy, researchParticipation: checked})}
                    />
                    <Label className="text-[#2D4B43]">Include in research studies</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  className="border-[#5C8D89]/20 text-[#1A3C40] hover:bg-[#5C8D89]/10"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={savePolicy}
                  className="medistacks-btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingPolicy ? 'Update Policy' : 'Create Policy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Existing Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map((policy) => (
          <motion.div
            key={policy.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group"
          >
            <Card className={`shimmer-card transition-all ${policy.isActive ? '' : 'opacity-60'}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-[#1A3C40] font-bold flex items-center">
                      {policy.name}
                      {policy.isActive ? (
                        <CheckCircle className="h-4 w-4 ml-2 text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 ml-2 text-yellow-400" />
                      )}
                    </CardTitle>
                    <CardDescription className="text-[#2D4B43] mt-1">
                      {policy.description}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(policy)}
                      className="text-[#1A3C40] hover:bg-[#5C8D89]/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deletePolicy(policy.id)}
                      className="text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center text-[#2D4B43]">
                    <Clock className="h-4 w-4 mr-1" />
                    {policy.accessDuration === 0 ? 'Permanent' : `${policy.accessDuration} days`}
                  </div>
                  <div className="flex items-center text-[#2D4B43]">
                    <Users className="h-4 w-4 mr-1" />
                    {policy.allowedRoles.length} role(s)
                  </div>
                  <div className="flex items-center text-[#2D4B43]">
                    <Database className="h-4 w-4 mr-1" />
                    {policy.dataTypes.length} data type(s)
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {policy.dataTypes.slice(0, 3).map(type => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {policy.dataTypes.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{policy.dataTypes.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-2">
                    {policy.autoApprove && (
                      <Badge className="bg-green-900/30 text-green-300 border-green-400/30">
                        Auto-approve
                      </Badge>
                    )}
                    {policy.emergencyOverride && (
                      <Badge className="bg-red-900/30 text-red-300 border-red-400/30">
                        Emergency
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePolicyStatus(policy.id)}
                    className={policy.isActive ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-green-400 hover:bg-green-400/10'}
                  >
                    {policy.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {policies.length === 0 && !isCreating && (
        <Card className="shimmer-card">
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-lime-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1A3C40] mb-2">No Consent Policies</h3>
            <p className="text-[#2D4B43] mb-4">
              Create your first consent policy to control how your medical data is accessed.
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="medistacks-btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Policy
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ConsentPolicies
