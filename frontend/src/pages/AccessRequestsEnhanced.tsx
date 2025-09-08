import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bell, Clock, User, Shield, CheckCircle, XCircle, 
  AlertTriangle, FileText, Calendar, MapPin, Stethoscope,
  Search, Filter, Eye, MessageSquare, History
} from 'lucide-react'
import { useStacks } from '@/contexts/StacksContext'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { uintCV, principalCV, stringAsciiCV } from '@stacks/transactions'

interface AccessRequest {
  id: string
  requesterId: string
  requesterName: string
  requesterRole: 'doctor' | 'researcher' | 'emergency' | 'pharmacist'
  requesterInstitution: string
  dataTypes: string[]
  purpose: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
  requestedDuration: number // days
  timestamp: Date
  status: 'pending' | 'approved' | 'denied' | 'expired'
  patientResponse?: string
  autoApproved: boolean
  matchingPolicyId?: string
  expiresAt?: Date
  accessLog: AccessLogEntry[]
}

interface AccessLogEntry {
  timestamp: Date
  action: 'requested' | 'approved' | 'denied' | 'accessed' | 'expired'
  actor: string
  details?: string
}

const AccessRequestsEnhanced = () => {
  const { callContractFunction } = useStacks()
  const { toast } = useToast()
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [responseMessage, setResponseMessage] = useState('')

  useEffect(() => {
    loadAccessRequests()
  }, [])

  const loadAccessRequests = () => {
    // Mock data - in production would load from blockchain
    const mockRequests: AccessRequest[] = [
      {
        id: '1',
        requesterId: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        requesterName: 'Dr. Sarah Johnson',
        requesterRole: 'doctor',
        requesterInstitution: 'City General Hospital',
        dataTypes: ['Medical History', 'Current Medications', 'Lab Results'],
        purpose: 'Routine consultation for ongoing treatment of diabetes management',
        urgency: 'medium',
        requestedDuration: 7,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'pending',
        autoApproved: false,
        accessLog: [
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            action: 'requested',
            actor: 'Dr. Sarah Johnson',
            details: 'Initial access request submitted'
          }
        ]
      },
      {
        id: '2',
        requesterId: 'ST2REHHS5J3CERCRBEPMGH7921Q6PYKAADT7JP2VB',
        requesterName: 'Dr. Michael Chen',
        requesterRole: 'doctor',
        requesterInstitution: 'Emergency Department - St. Mary\'s',
        dataTypes: ['Basic Demographics', 'Allergies', 'Current Medications', 'Medical History'],
        purpose: 'Emergency treatment - patient unconscious, need immediate medical history',
        urgency: 'emergency',
        requestedDuration: 1,
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        status: 'approved',
        autoApproved: true,
        matchingPolicyId: '2',
        expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours from now
        accessLog: [
          {
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            action: 'requested',
            actor: 'Dr. Michael Chen',
            details: 'Emergency access request'
          },
          {
            timestamp: new Date(Date.now() - 29 * 60 * 1000),
            action: 'approved',
            actor: 'System (Auto-approval)',
            details: 'Matched emergency access policy'
          },
          {
            timestamp: new Date(Date.now() - 25 * 60 * 1000),
            action: 'accessed',
            actor: 'Dr. Michael Chen',
            details: 'Viewed patient medical history'
          }
        ]
      },
      {
        id: '3',
        requesterId: 'ST3NBRSFKX8CKMQNF7UUXGYMQB5LUIXD43E62SB6',
        requesterName: 'Dr. Lisa Rodriguez',
        requesterRole: 'researcher',
        requesterInstitution: 'Stanford Medical Research',
        dataTypes: ['Demographics', 'Treatment Outcomes', 'Lab Results'],
        purpose: 'Cardiovascular disease outcomes study - analyzing treatment effectiveness',
        urgency: 'low',
        requestedDuration: 90,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'denied',
        patientResponse: 'I prefer not to participate in research studies at this time.',
        autoApproved: false,
        accessLog: [
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            action: 'requested',
            actor: 'Dr. Lisa Rodriguez',
            details: 'Research access request submitted'
          },
          {
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            action: 'denied',
            actor: 'Patient',
            details: 'Patient declined research participation'
          }
        ]
      }
    ]
    setRequests(mockRequests)
  }

  const handleApprove = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId)
    if (!request) return

    try {
      // Approve access on blockchain
      await callContractFunction('approve-access', [
        uintCV(parseInt(request.id)),
        principalCV(request.requesterId),
        uintCV(request.requestedDuration * 24 * 60), // Convert days to blocks (assuming ~10 min blocks)
        stringAsciiCV('approved')
      ])

      const updatedRequests = requests.map(r => 
        r.id === requestId 
          ? { 
              ...r, 
              status: 'approved' as const,
              patientResponse: responseMessage,
              expiresAt: new Date(Date.now() + r.requestedDuration * 24 * 60 * 60 * 1000),
              accessLog: [
                ...r.accessLog,
                {
                  timestamp: new Date(),
                  action: 'approved' as const,
                  actor: 'Patient',
                  details: responseMessage || 'Access approved'
                }
              ]
            }
          : r
      )
      
      setRequests(updatedRequests)
      setResponseMessage('')
      setSelectedRequest(null)

      toast({
        title: "Access Approved ✅",
        description: `${request.requesterName} can now access your medical data.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve access request.",
        variant: "destructive"
      })
    }
  }

  const handleDeny = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId)
    if (!request) return

    try {
      // Deny access on blockchain
      await callContractFunction('deny-access', [
        uintCV(parseInt(request.id)),
        principalCV(request.requesterId)
      ])

      const updatedRequests = requests.map(r => 
        r.id === requestId 
          ? { 
              ...r, 
              status: 'denied' as const,
              patientResponse: responseMessage,
              accessLog: [
                ...r.accessLog,
                {
                  timestamp: new Date(),
                  action: 'denied' as const,
                  actor: 'Patient',
                  details: responseMessage || 'Access denied'
                }
              ]
            }
          : r
      )
      
      setRequests(updatedRequests)
      setResponseMessage('')
      setSelectedRequest(null)

      toast({
        title: "Access Denied ❌",
        description: `${request.requesterName}'s request has been denied.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deny access request.",
        variant: "destructive"
      })
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-900/30 text-red-300 border-red-400/30'
      case 'high': return 'bg-orange-900/30 text-orange-300 border-orange-400/30'
      case 'medium': return 'bg-yellow-900/30 text-yellow-300 border-yellow-400/30'
      case 'low': return 'bg-green-900/30 text-green-300 border-green-400/30'
      default: return 'bg-gray-900/30 text-gray-300 border-gray-400/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-900/30 text-green-300 border-green-400/30'
      case 'denied': return 'bg-red-900/30 text-red-300 border-red-400/30'
      case 'pending': return 'bg-yellow-900/30 text-yellow-300 border-yellow-400/30'
      case 'expired': return 'bg-gray-900/30 text-gray-300 border-gray-400/30'
      default: return 'bg-gray-900/30 text-gray-300 border-gray-400/30'
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter
    const matchesSearch = request.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requesterInstitution.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8EB] via-[#F3F8F7] to-[#F9F8EB] p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1A3C40] flex items-center">
            <Bell className="h-8 w-8 mr-3 text-lime-400" />
            Access Requests
            {pendingCount > 0 && (
              <Badge className="ml-3 bg-red-900/30 text-red-300 border-red-400/30">
                {pendingCount} pending
              </Badge>
            )}
          </h1>
          <p className="text-[#2D4B43] mt-2">
            Review and manage requests to access your medical data
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="shimmer-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-400" />
                <Input
                  placeholder="Search by doctor name, institution, or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-dark-800/50 border-lime-400/30 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'approved', 'denied'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status as any)}
                  className={filter === status ? "medistacks-btn-primary" : "border-lime-400/30 text-lime-300 hover:bg-lime-400/10"}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group"
            >
              <Card className={`shimmer-card transition-all hover:border-lime-400/50 ${
                request.urgency === 'emergency' ? 'border-red-400/50 animate-pulse' : ''
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-5 w-5 text-lime-400" />
                          <CardTitle className="text-lime-300">{request.requesterName}</CardTitle>
                        </div>
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {request.urgency}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                        {request.autoApproved && (
                          <Badge className="bg-blue-900/30 text-blue-300 border-blue-400/30">
                            Auto-approved
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-teal-200">
                        {request.requesterInstitution} • {request.requesterRole}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-teal-300">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {request.timestamp.toLocaleString()}
                      </div>
                      {request.expiresAt && (
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Expires: {request.expiresAt.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-lime-300 text-sm font-medium">Purpose</Label>
                    <p className="text-teal-200 mt-1">{request.purpose}</p>
                  </div>

                  <div>
                    <Label className="text-lime-300 text-sm font-medium">Requested Data Types</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {request.dataTypes.map(type => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-teal-200">
                      <User className="h-4 w-4 mr-1" />
                      Duration: {request.requestedDuration} day(s)
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedRequest(selectedRequest?.id === request.id ? null : request)}
                      className="text-lime-300 hover:bg-lime-400/10"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {selectedRequest?.id === request.id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {selectedRequest?.id === request.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-lime-400/20 pt-4 space-y-4"
                      >
                        <div>
                          <Label className="text-lime-300 text-sm font-medium">Access Log</Label>
                          <div className="mt-2 space-y-2">
                            {request.accessLog.map((log, index) => (
                              <div key={index} className="flex items-center space-x-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-lime-400"></div>
                                <div className="flex-1">
                                  <span className="text-white font-medium">{log.action}</span>
                                  <span className="text-teal-200 ml-2">by {log.actor}</span>
                                  {log.details && <span className="text-teal-300 ml-2">- {log.details}</span>}
                                </div>
                                <span className="text-teal-400">{log.timestamp.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="space-y-3">
                            <Label className="text-lime-300">Response Message (Optional)</Label>
                            <Textarea
                              value={responseMessage}
                              onChange={(e) => setResponseMessage(e.target.value)}
                              placeholder="Add a message with your decision..."
                              className="bg-dark-800/50 border-lime-400/30 text-white"
                              rows={3}
                            />
                            <div className="flex space-x-3">
                              <Button
                                onClick={() => handleApprove(request.id)}
                                className="medistacks-btn-primary"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Access
                              </Button>
                              <Button
                                onClick={() => handleDeny(request.id)}
                                variant="outline"
                                className="border-red-400/30 text-red-300 hover:bg-red-400/10"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Deny Access
                              </Button>
                            </div>
                          </div>
                        )}

                        {request.patientResponse && (
                          <div>
                            <Label className="text-lime-300 text-sm font-medium">Your Response</Label>
                            <p className="text-teal-200 mt-1 p-3 bg-dark-800/30 rounded-lg">
                              {request.patientResponse}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredRequests.length === 0 && (
        <Card className="shimmer-card">
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-lime-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {filter === 'all' ? 'No Access Requests' : `No ${filter} Requests`}
            </h3>
            <p className="text-teal-200">
              {searchTerm 
                ? 'No requests match your search criteria.' 
                : filter === 'all' 
                  ? 'You have no access requests at this time.'
                  : `You have no ${filter} access requests.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AccessRequestsEnhanced
