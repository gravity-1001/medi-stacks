import { useState, useEffect } from 'react'
import { useStacks } from '@/contexts/StacksContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { 
  AlertTriangle, 
  Clock, 
  Shield, 
  Activity,
  Calendar,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { uintCV, principalCV } from '@stacks/transactions'

interface EmergencyMode {
  patient: string
  expiryHeight: number
  isActive: boolean
}

const Emergency = () => {
  const { callContractFunction, callReadOnlyFunction, userData } = useStacks()
  const { } = useAuth()
  
  // Check if user has emergency responder role from localStorage or context
  const selectedRole = localStorage.getItem('medistacks.selectedRole')
  const isEmergencyResponder = selectedRole === 'emergency_responder'
  const { toast } = useToast()
  const [emergencyMode, setEmergencyMode] = useState<EmergencyMode | null>(null)
  const [loading, setLoading] = useState(false)
  const [expiryHours, setExpiryHours] = useState<number>(24)
  const [accessibleRecords, setAccessibleRecords] = useState<any[]>([])

  const loadEmergencyStatus = async () => {
    if (!userData?.profile?.stxAddress?.testnet) return

    try {
      const result = await callReadOnlyFunction('get-emergency', [
        principalCV(userData.profile.stxAddress.testnet)
      ])
      
      if (result.value) {
        const expiryHeight = result.value.expiryHeight.value
        const currentHeight = 100000 // Mock current block height
        
        setEmergencyMode({
          patient: userData.profile.stxAddress.testnet,
          expiryHeight: expiryHeight,
          isActive: expiryHeight > currentHeight
        })
      } else {
        setEmergencyMode(null)
      }
    } catch (error) {
      console.error('Error loading emergency status:', error)
    }
  }

  const enableEmergencyMode = async () => {
    setLoading(true)
    try {
      const currentHeight = 100000 // Mock current block height
      const expiryHeight = currentHeight + (expiryHours * 6) // Assuming 10 minutes per block

      await callContractFunction('enable-emergency', [
        uintCV(expiryHeight)
      ])

      toast({
        title: "Emergency Mode Enabled",
        description: `Emergency access enabled for ${expiryHours} hours`
      })

      loadEmergencyStatus()
    } catch (error) {
      console.error('Error enabling emergency mode:', error)
      toast({
        title: "Error",
        description: "Failed to enable emergency mode",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAccessibleRecords = async () => {
    if (!isEmergencyResponder) return

    // Mock data for emergency accessible records
    const mockRecords = [
      {
        id: 1,
        patient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        emergencyExpiry: Date.now() + 86400000,
        recordType: 'Critical Medications',
        contentHash: '0x1a2b3c4d5e6f7890abcdef1234567890',
        dataUri: 'medistacks://encrypted/emergency/record1',
        lastUpdated: Date.now() - 3600000
      },
      {
        id: 2,
        patient: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        emergencyExpiry: Date.now() + 43200000,
        recordType: 'Allergies & Conditions',
        contentHash: '0x9876543210fedcba0987654321abcdef',
        dataUri: 'medistacks://encrypted/emergency/record2',
        lastUpdated: Date.now() - 7200000
      }
    ]
    setAccessibleRecords(mockRecords)
  }

  useEffect(() => {
    loadEmergencyStatus()
    if (isEmergencyResponder) {
      loadAccessibleRecords()
    }
  }, [userData, isEmergencyResponder])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Emergency Access</h1>
        </div>
        <p className="text-red-100">
          {isEmergencyResponder 
            ? "Access critical medical records during emergency situations"
            : "Enable emergency access to your medical records for emergency responders"
          }
        </p>
      </div>

      {/* Patient Emergency Mode */}
      {!isEmergencyResponder && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-medical-600" />
                <span>Your Emergency Mode</span>
              </CardTitle>
              <CardDescription>
                Enable emergency access to your medical records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {emergencyMode?.isActive ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">Emergency Mode Active</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Emergency responders can access your critical medical records.
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Expires at block height: {emergencyMode.expiryHeight}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Emergency Mode Disabled</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Emergency responders cannot access your records.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emergency Access Duration (hours)
                    </label>
                    <Input
                      type="number"
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(Number(e.target.value))}
                      min="1"
                      max="168"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      How long emergency responders can access your records (1-168 hours)
                    </p>
                  </div>
                  
                  <Button
                    onClick={enableEmergencyMode}
                    variant="medical"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {loading ? 'Enabling...' : 'Enable Emergency Mode'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-medical-600" />
                <span>How It Works</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-medical-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Enable Emergency Mode</p>
                    <p className="text-sm text-gray-600">Set how long emergency responders can access your records</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-medical-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Emergency Access</p>
                    <p className="text-sm text-gray-600">Certified emergency responders can view critical medical information</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-medical-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Automatic Expiry</p>
                    <p className="text-sm text-gray-600">Access automatically expires after the set duration</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-blue-800">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Only verified emergency responders with the proper role can access your records during emergency mode.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Emergency Responder View */}
      {isEmergencyResponder && (
        <div className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Emergency Access Dashboard</span>
              </CardTitle>
              <CardDescription>
                Access critical medical records during emergency situations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{accessibleRecords.length}</div>
                  <p className="text-sm text-red-700">Active Emergency Records</p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {accessibleRecords.filter(r => r.emergencyExpiry - Date.now() < 3600000).length}
                  </div>
                  <p className="text-sm text-yellow-700">Expiring Soon (&lt;1hr)</p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">24/7</div>
                  <p className="text-sm text-green-700">Emergency Access</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accessible Records */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Emergency Accessible Records</h2>
            
            {accessibleRecords.length === 0 ? (
              <Card className="medical-card p-8 text-center">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Emergency Records</h3>
                <p className="text-gray-600">
                  No patients have currently enabled emergency access mode.
                </p>
              </Card>
            ) : (
              accessibleRecords.map((record) => (
                <Card key={record.id} className="medical-card border-l-4 border-l-red-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-red-900">
                            Emergency Record - {record.recordType}
                          </CardTitle>
                          <CardDescription className="flex items-center space-x-4 mt-1">
                            <span className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{record.patient.slice(0, 8)}...{record.patient.slice(-8)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(record.lastUpdated)}</span>
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-sm">
                          <Clock className="h-4 w-4 text-red-600" />
                          <span className="text-red-600 font-medium">
                            Expires: {formatDate(record.emergencyExpiry)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800 font-medium mb-1">
                          ⚠️ EMERGENCY ACCESS ONLY
                        </p>
                        <p className="text-xs text-red-700">
                          This record is accessible due to emergency mode. Use only for critical medical decisions.
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-600">
                            <strong>Content Hash:</strong> {record.contentHash}
                          </p>
                          <p className="text-xs text-gray-600">
                            <strong>Data URI:</strong> {record.dataUri}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <Button
                          variant="medical"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          Access Record
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Log Access
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Emergency
