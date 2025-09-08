import { useState, useEffect } from 'react'
import { useStacks } from '@/contexts/StacksContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Plus, 
  Search, 
  Eye, 
  Share2, 
  Lock, 
  Calendar,
  User,
  Shield
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { uintCV, stringUtf8CV, bufferCV, boolCV, principalCV } from '@stacks/transactions'

interface MedicalRecord {
  id: number
  title: string
  description: string
  category: string
  date: string
  doctor: string
  diagnosis: string
  treatment: string
  medications: string[]
  followUp: string
  contentHash: string
  uri: string
  researchOptIn: boolean
  owner?: string
  createdAt?: number
}

const Records = () => {
  const { callContractFunction, callReadOnlyFunction, userData } = useStacks()
  const { } = useAuth()
  
  // Get selected role from localStorage
  const selectedRole = localStorage.getItem('medistacks.selectedRole')
  const { toast } = useToast()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [newRecord, setNewRecord] = useState({
    title: '',
    description: '',
    file: null as File | null,
    researchOptIn: false
  })

  const isPatient = selectedRole === 'patient'
  const isDoctor = selectedRole === 'doctor'
  const isResearcher = selectedRole === 'researcher'

  // Function to generate content hash from record data
  const generateContentHash = (record: Partial<MedicalRecord>): Uint8Array => {
    const content = JSON.stringify(record)
    // Simple hash for demo - in production use proper hashing
    const hash = new Uint8Array(32)
    for (let i = 0; i < content.length && i < 32; i++) {
      hash[i] = content.charCodeAt(i)
    }
    return hash
  }

  const loadRecords = async () => {
    setLoading(true)
    try {
      const userAddress = userData?.profile?.stxAddress?.testnet
      if (!userAddress) {
        setRecords([])
        return
      }

      const verifiedRecords: MedicalRecord[] = []
      
      // Check a range of record IDs (in production, would have a registry)
      for (let id = 1; id <= 10; id++) {
        try {
          const recordData = await callReadOnlyFunction('get-record', [uintCV(id)])
          
          if (recordData?.value) {
            const owner = recordData.value.owner?.value
            const contentHash = recordData.value['content-hash']?.value
            const uri = recordData.value.uri?.value
            const researchOptIn = recordData.value['research-opt-in']?.value === true
            const createdAt = recordData.value['created-at']?.value || 0
            
            // Only show records the user owns or has access to
            if (isPatient && owner === userAddress) {
              // Patient sees their own records
              verifiedRecords.push({
                id,
                title: `Medical Record #${id}`,
                description: 'Verified blockchain record',
                category: 'general',
                date: new Date(Number(createdAt) * 1000).toLocaleDateString(),
                doctor: 'Dr. Smith',
                diagnosis: 'Loaded from blockchain',
                treatment: 'See details',
                medications: [],
                followUp: 'As needed',
                contentHash: contentHash || '',
                uri: uri || '',
                researchOptIn,
                owner,
                createdAt: Number(createdAt)
              })
            } else if ((isDoctor || isResearcher) && owner !== userAddress) {
              // Check if doctor/researcher has access
              const hasAccess = await callReadOnlyFunction('has-access', [
                uintCV(id),
                principalCV(userAddress)
              ])
              
              if (hasAccess?.value?.allowed?.value === true) {
                verifiedRecords.push({
                  id,
                  title: `Patient Record #${id}`,
                  description: 'Authorized access',
                  category: 'patient',
                  date: new Date(Number(createdAt) * 1000).toLocaleDateString(),
                  doctor: 'Various',
                  diagnosis: 'Authorized to view',
                  treatment: 'See details',
                  medications: [],
                  followUp: 'As scheduled',
                  contentHash: contentHash || '',
                  uri: uri || '',
                  researchOptIn,
                  owner,
                  createdAt: Number(createdAt)
                })
              }
            }
          }
        } catch (error) {
          // Record doesn't exist or error reading
          console.debug(`No record found for ID ${id}`)
        }
      }

      // Add mock records for demo if no blockchain records found
      if (verifiedRecords.length === 0) {
        const mockRecords: MedicalRecord[] = [
          {
            id: 1,
            title: 'Medical Record #1',
            description: 'Demo record for preview',
            category: 'general',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            doctor: 'Dr. Demo',
            diagnosis: 'N/A',
            treatment: 'N/A',
            medications: [],
            followUp: 'As needed',
            contentHash: '0x1234567890abcdef',
            uri: 'medistacks://encrypted/record1',
            researchOptIn: true,
            createdAt: Date.now() - 86400000,
            owner: userData?.profile?.stxAddress?.testnet || ''
          },
          {
            id: 2,
            title: 'Medical Record #2',
            description: 'Demo record for preview',
            category: 'general',
            date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
            doctor: 'Dr. Demo',
            diagnosis: 'N/A',
            treatment: 'N/A',
            medications: [],
            followUp: 'As scheduled',
            contentHash: '0xabcdef1234567890',
            uri: 'medistacks://encrypted/record2',
            researchOptIn: false,
            createdAt: Date.now() - 172800000,
            owner: userData?.profile?.stxAddress?.testnet || ''
          }
        ]
        setRecords(mockRecords)
      } else {
        setRecords(verifiedRecords)
      }
    } catch (error) {
      console.error('Error loading records:', error)
      const mockRecords: MedicalRecord[] = [
        {
          id: 1,
          title: 'Medical Record #1',
          description: 'Demo record for preview',
          category: 'general',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          doctor: 'Dr. Demo',
          diagnosis: 'N/A',
          treatment: 'N/A',
          medications: [],
          followUp: 'As needed',
          contentHash: '0x1234567890abcdef',
          uri: 'medistacks://encrypted/record1',
          researchOptIn: true,
          createdAt: Date.now() - 86400000,
          owner: userData?.profile?.stxAddress?.testnet || ''
        },
        {
          id: 2,
          title: 'Medical Record #2',
          description: 'Demo record for preview',
          category: 'general',
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          doctor: 'Dr. Demo',
          diagnosis: 'N/A',
          treatment: 'N/A',
          medications: [],
          followUp: 'As scheduled',
          contentHash: '0xabcdef1234567890',
          uri: 'medistacks://encrypted/record2',
          researchOptIn: false,
          createdAt: Date.now() - 172800000,
          owner: userData?.profile?.stxAddress?.testnet || ''
        }
      ]
      setRecords(mockRecords) // Fallback to mock data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [userData])

  const handleAddRecord = async () => {
    if (!newRecord.title || !newRecord.description) return
    
    const record: MedicalRecord = {
      // Spread form values first to avoid duplicate key overwrites
      ...newRecord,
      id: Date.now(), // Use timestamp as unique ID for new records
      title: newRecord.title,
      description: newRecord.description,
      category: 'general',
      date: new Date().toISOString().split('T')[0],
      doctor: selectedRole === 'doctor' ? 'Dr. ' + (userData?.profile?.stxAddress?.testnet?.slice(0, 6) || 'Unknown') : 'Self',
      diagnosis: 'Pending',
      treatment: 'Pending',
      medications: [],
      followUp: 'As needed',
      contentHash: '',
      uri: `medistacks://records/${Date.now()}`,
      researchOptIn: newRecord.researchOptIn,
      owner: userData?.profile?.stxAddress?.testnet,
      createdAt: Date.now()
    }

    try {
      // Generate content hash
      const contentHash = generateContentHash(record)
      
      // Register on blockchain
      await callContractFunction('register-record', [
        uintCV(record.id),
        bufferCV(contentHash),
        stringUtf8CV(record.uri),
        boolCV(record.researchOptIn)
      ])

      setRecords([...records, record])
      setShowAddForm(false)
      setNewRecord({
        title: '',
        description: '',
        file: null,
        researchOptIn: false
      })
      
      toast({
        title: "Success",
        description: "Medical record registered on blockchain"
      })
    } catch (error) {
      console.error('Error registering record:', error)
      toast({
        title: "Error", 
        description: "Failed to register record on blockchain",
        variant: "destructive"
      })
    }
  }

  const toggleResearchOptIn = async (recordId: number) => {
    try {
      const record = records.find(r => r.id === recordId)
      if (!record) return

      // Check ownership before allowing toggle
      const recordData = await callReadOnlyFunction('get-record', [uintCV(recordId)])
      const owner = recordData?.value?.owner?.value
      const userAddress = userData?.profile?.stxAddress?.testnet

      if (owner !== userAddress) {
        toast({
          title: "Error",
          description: "You can only modify your own records",
          variant: "destructive"
        })
        return
      }

      const newOptInStatus = !record.researchOptIn
      await callContractFunction('set-research-opt-in', [
        uintCV(recordId),
        boolCV(newOptInStatus)
      ])

      setRecords(records.map(r => 
        r.id === recordId ? { ...r, researchOptIn: newOptInStatus } : r
      ))

      toast({
        title: "Success",
        description: `Research opt-in ${newOptInStatus ? 'enabled' : 'disabled'}`
      })
    } catch (error) {
      console.error('Error toggling research opt-in:', error)
      toast({
        title: "Error",
        description: "Failed to update research opt-in status",
        variant: "destructive"
      })
    }
  }

  // Function to check if user can edit a record
  const canEditRecord = (record: MedicalRecord): boolean => {
    const userAddress = userData?.profile?.stxAddress?.testnet
    return isPatient && record.owner === userAddress
  }

  const filteredRecords = records.filter(() =>
    // For now, show all records. In a real implementation, this would filter based on searchTerm
    true
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8EB] via-[#F3F8F7] to-[#F9F8EB] p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedRole === 'researcher' ? 'My Studies' : 
             selectedRole === 'doctor' ? 'Patient Records' : 
             'Medical Records'}
          </h1>
          <p className="text-gray-600 mt-2">
            {selectedRole === 'researcher' ? 'Manage your research studies and data access' : 
             selectedRole === 'doctor' ? 'Access and manage patient medical records' : 
             'Manage your secure medical records on the blockchain'}
          </p>
        </div>
        {selectedRole !== 'researcher' && (
          <Button
            onClick={() => setShowAddForm(true)}
            variant="medical"
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{selectedRole === 'doctor' ? 'Add Patient Record' : 'Add Record'}</span>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={selectedRole === 'researcher' ? 'Search studies...' : 
                      selectedRole === 'doctor' ? 'Search patient records...' : 
                      'Search medical records...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Record Form */}
      {showAddForm && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>
              {selectedRole === 'doctor' ? 'Add New Patient Record' : 'Add New Medical Record'}
            </CardTitle>
            <CardDescription>
              {selectedRole === 'doctor' ? 
                'Upload a new patient medical record to the blockchain' : 
                'Upload a new medical record to the blockchain'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Record Title *
              </label>
              <Input
                value={newRecord.title}
                onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
                placeholder="e.g., Blood Test Results - Jan 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Input
                value={newRecord.description}
                onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                placeholder="Brief description of the medical record"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Upload
              </label>
              <Input
                type="file"
                onChange={(e) => setNewRecord({ ...newRecord, file: e.target.files?.[0] || null })}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, Images, Word documents
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="researchOptIn"
                checked={newRecord.researchOptIn}
                onChange={(e) => setNewRecord({ ...newRecord, researchOptIn: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="researchOptIn" className="text-sm text-gray-700">
                Allow this record to be used for research (you can earn STX tokens)
              </label>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleAddRecord}
                variant="medical"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Record'}
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records List */}
      <div className="space-y-4">
        {loading && !showAddForm ? (
          <Card className="medical-card p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading medical records...</p>
          </Card>
        ) : filteredRecords.length === 0 ? (
          <Card className="medical-card p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {selectedRole === 'researcher' ? 'No Research Studies' : 
               selectedRole === 'doctor' ? 'No Patient Records' : 
               'No Medical Records'}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedRole === 'researcher' ? 
                'No research studies found. Access data through the Data Marketplace.' : 
               selectedRole === 'doctor' ? 
                'No patient records found. Start by adding your first patient record.' : 
                'You haven\'t added any medical records yet. Start by adding your first record.'}
            </p>
            {selectedRole !== 'researcher' && (
              <Button
                onClick={() => setShowAddForm(true)}
                variant="medical"
              >
                {selectedRole === 'doctor' ? 'Add First Patient Record' : 'Add Your First Record'}
              </Button>
            )}
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="medical-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-medical-100 rounded-lg">
                      <FileText className="h-6 w-6 text-medical-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedRole === 'researcher' ? `Research Study #${record.id}` : 
                         selectedRole === 'doctor' ? `Patient Record #${record.id}` : 
                         `Medical Record #${record.id}`}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(record.createdAt)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>You</span>
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {record.researchOptIn ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Share2 className="h-3 w-3 mr-1" />
                        Research Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      <strong>Content Hash:</strong> {record.contentHash}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Storage URI:</strong> {record.uri}
                    </p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    
                    {canEditRecord(record) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleResearchOptIn(record.id)}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {record.researchOptIn ? 'Disable' : 'Enable'} Research
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Access
                    </Button>
                  </div>
                </div>
                
                {canEditRecord(record) && (
                  <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
                    <span className="text-xs text-gray-500">
                      {record.owner ? `Owner: ${record.owner.slice(0, 8)}...` : 'Local record'}
                    </span>
                  </div>
                )}
                
                {!canEditRecord(record) && record.owner && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-xs text-gray-500">
                      Owner: {record.owner.slice(0, 8)}...{record.owner.slice(-6)}
                    </span>
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      Authorized Access
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default Records
