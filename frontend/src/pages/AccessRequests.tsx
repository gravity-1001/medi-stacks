import { useState, useEffect } from 'react'
import { useStacks } from '@/contexts/StacksContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search,
  FileText,
  User,
  Calendar,
  MessageSquare
} from 'lucide-react'
import { formatDate, statusToDisplayName, getStatusColor, roleToDisplayName } from '@/lib/utils'
import { uintCV, principalCV, stringUtf8CV, someCV, noneCV, stringAsciiCV } from '@stacks/transactions'

interface AccessRequest {
  recordId: number
  requester: string
  createdAt: number
  purpose: string
  status: number // 0=pending, 1=approved, 2=denied
  requesterRole: string
  recordOwner?: string // Add owner for tracking
}

const AccessRequests = () => {
  const { callContractFunction, callReadOnlyFunction, userData } = useStacks()
  const { userRoles, isDoctor, isResearcher } = useAuth()
  // Determine selected role (fallback to localStorage)
  const selectedRole =
    typeof window !== 'undefined' ? localStorage.getItem('medistacks.selectedRole') : null
  const isPatient = selectedRole === 'patient' || (!isDoctor && !isResearcher)
  const { toast } = useToast()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [myRecords, setMyRecords] = useState<number[]>([]) // Track user's record IDs
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all')

  const loadAccessRequests = async () => {
    setLoading(true)
    try {
      const userAddress = userData?.profile?.stxAddress?.testnet
      if (!userAddress) {
        setRequests([])
        return
      }

      const allRequests: AccessRequest[] = []

      if (isPatient) {
        // For patients: load requests for their records
        // First, get user's records (in production, would query records by owner)
        // For demo, using a range of record IDs
        const recordIds = [1, 2, 3, 4, 5] // In production, fetch actual record IDs owned by user
        
        for (const recordId of recordIds) {
          // Check common requesters (would need a registry in production)
          const potentialRequesters = [
            'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
            'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
            'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP'
          ]

          for (const requester of potentialRequesters) {
            try {
              const result = await callReadOnlyFunction('get-access-request', [
                uintCV(recordId),
                principalCV(requester)
              ])

              if (result?.value) {
                const requestData = result.value
                const status = requestData?.status?.value || 0
                const createdAt = requestData?.['created-at']?.value || 0
                const purposeOpt = requestData?.purpose?.value
                let purpose = 'No purpose specified'
                
                if (purposeOpt?.value) {
                  // Extract string from optional
                  purpose = purposeOpt.value?.data || 'No purpose specified'
                }

                // Check requester's role
                let requesterRole = 'unknown'
                const roles = ['doctor', 'researcher', 'emergency_responder']
                for (const role of roles) {
                  const hasRole = await callReadOnlyFunction('has-role', [
                    principalCV(requester),
                    stringAsciiCV(role)
                  ])
                  if (hasRole?.value === true) {
                    requesterRole = role
                    break
                  }
                }

                allRequests.push({
                  recordId,
                  requester,
                  createdAt: Number(createdAt),
                  purpose,
                  status: Number(status),
                  requesterRole,
                  recordOwner: userAddress
                })
              }
            } catch (error) {
              // No request exists for this combination
              console.debug(`No request for record ${recordId} from ${requester}`)
            }
          }
        }
      } else {
        // For doctors/researchers: load their own requests
        // Check requests they've made to various records
        const recordIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] // Check a range of records
        
        for (const recordId of recordIds) {
          try {
            const result = await callReadOnlyFunction('get-access-request', [
              uintCV(recordId),
              principalCV(userAddress)
            ])

            if (result?.value) {
              const requestData = result.value
              const status = requestData?.status?.value || 0
              const createdAt = requestData?.['created-at']?.value || 0
              const purposeOpt = requestData?.purpose?.value
              let purpose = 'No purpose specified'
              
              if (purposeOpt?.value) {
                purpose = purposeOpt.value?.data || 'No purpose specified'
              }

              // Get record owner (would need get-record in production)
              const recordInfo = await callReadOnlyFunction('get-record', [
                uintCV(recordId)
              ])
              const recordOwner = recordInfo?.value?.owner?.value || 'Unknown'

              allRequests.push({
                recordId,
                requester: userAddress,
                createdAt: Number(createdAt),
                purpose,
                status: Number(status),
                requesterRole: selectedRole || 'unknown',
                recordOwner
              })
            }
          } catch (error) {
            // No request exists for this record
            console.debug(`No request for record ${recordId} from current user`)
          }
        }
      }

      setRequests(allRequests)
    } catch (error) {
      console.error('Error loading access requests:', error)
      toast({
        title: "Error",
        description: "Failed to load access requests from blockchain",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (recordId: number, requester: string) => {
    try {
      const expiryHeight = 0 // No expiry for approved access
      const roleScope = requests.find(r => r.recordId === recordId && r.requester === requester)?.requesterRole || 'general'

      await callContractFunction('approve-access', [
        uintCV(recordId),
        principalCV(requester),
        uintCV(expiryHeight),
        stringAsciiCV(roleScope)
      ])

      toast({
        title: "Success",
        description: "Access request approved successfully"
      })

      loadAccessRequests()
    } catch (error) {
      console.error('Error approving request:', error)
      toast({
        title: "Error",
        description: "Failed to approve access request",
        variant: "destructive"
      })
    }
  }

  const handleDenyRequest = async (recordId: number, requester: string) => {
    try {
      await callContractFunction('deny-access', [
        uintCV(recordId),
        principalCV(requester)
      ])

      toast({
        title: "Success",
        description: "Access request denied"
      })

      loadAccessRequests()
    } catch (error) {
      console.error('Error denying request:', error)
      toast({
        title: "Error",
        description: "Failed to deny access request",
        variant: "destructive"
      })
    }
  }

  const requestAccess = async (recordId: number, purpose: string) => {
    if (!isDoctor && !isResearcher) {
      toast({
        title: "Error",
        description: "Only doctors and researchers can request access",
        variant: "destructive"
      })
      return
    }

    try {
      const purposeArg = purpose.trim() ? someCV(stringUtf8CV(purpose.trim())) : noneCV()
      
      await callContractFunction('request-access', [
        uintCV(recordId),
        purposeArg
      ])

      toast({
        title: "Success",
        description: "Access request submitted successfully"
      })

      loadAccessRequests()
    } catch (error) {
      console.error('Error requesting access:', error)
      toast({
        title: "Error",
        description: "Failed to submit access request",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    loadAccessRequests()
  }, [])

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requester.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'pending' && request.status === 0) ||
                         (filter === 'approved' && request.status === 1) ||
                         (filter === 'denied' && request.status === 2)
    return matchesSearch && matchesFilter
  })

  const pendingCount = requests.filter(r => r.status === 0).length
  const approvedCount = requests.filter(r => r.status === 1).length
  const deniedCount = requests.filter(r => r.status === 2).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isPatient ? 'Access Requests' : 'My Access Requests'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isPatient
            ? 'Manage access requests to your medical records'
            : 'Track the status of access requests you have submitted'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Users className="h-4 w-4 text-medical-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denied</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{deniedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex space-x-2">
          {['all', 'pending', 'approved', 'denied'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'medical' : 'outline'}
              size="sm"
              onClick={() => setFilter(status as any)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="medical-card p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading access requests...</p>
          </Card>
        ) : filteredRequests.length === 0 ? (
          <Card className="medical-card p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Access Requests</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You don't have any access requests yet."
                : `No ${filter} access requests found.`
              }
            </p>
          </Card>
        ) : (
          filteredRequests.map((request, index) => (
            <Card key={index} className="medical-card">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-medical-100 rounded-lg">
                      <FileText className="h-6 w-6 text-medical-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Record #{request.recordId} Access Request
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{roleToDisplayName(request.requesterRole)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(request.createdAt)}</span>
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {statusToDisplayName(request.status)}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Requester Address:</p>
                    <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                      {request.requester}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Purpose:</p>
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600">{request.purpose}</p>
                    </div>
                  </div>
                  
                  {isPatient && request.status === 0 && (
                    <div className="flex space-x-4 pt-2">
                      <Button
                        onClick={() => handleApproveRequest(request.recordId, request.requester)}
                        variant="medical"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      
                      <Button
                        onClick={() => handleDenyRequest(request.recordId, request.requester)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Deny
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default AccessRequests
