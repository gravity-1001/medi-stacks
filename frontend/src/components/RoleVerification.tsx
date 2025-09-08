import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock, UserCheck, Send } from 'lucide-react'
import { useStacks } from '@/contexts/StacksContext'
import { useAuth } from '@/contexts/AuthContext'
import { principalCV, stringAsciiCV, boolCV } from '@stacks/transactions'
import { useToast } from '@/hooks/use-toast'

interface RoleVerificationProps {
  requestedRole: 'doctor' | 'researcher' | 'emergency_responder'
  onComplete?: () => void
}

export const RoleVerification = ({ requestedRole, onComplete }: RoleVerificationProps) => {
  const { callContractFunction, callReadOnlyFunction, userData } = useStacks()
  const { checkUserRoles } = useAuth()
  const { toast } = useToast()
  const [status, setStatus] = useState<'pending' | 'submitted' | 'approved' | 'denied'>('pending')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationRequest, setVerificationRequest] = useState<any>(null)

  useEffect(() => {
    checkRoleStatus()
  }, [])

  const checkRoleStatus = async () => {
    try {
      const userAddress = userData?.profile?.stxAddress?.testnet
      if (!userAddress) return

      // Check if user already has the role
      const hasRole = await callReadOnlyFunction('has-role', [
        principalCV(userAddress),
        stringAsciiCV(requestedRole)
      ])

      if (hasRole?.value === true) {
        setStatus('approved')
        return
      }

      // Check if there's a pending request (would need a separate tracking system)
      const storedRequest = localStorage.getItem(`medistacks.roleRequest.${requestedRole}`)
      if (storedRequest) {
        setVerificationRequest(JSON.parse(storedRequest))
        setStatus('submitted')
      }
    } catch (error) {
      console.error('Error checking role status:', error)
    }
  }

  const submitRoleRequest = async () => {
    setIsSubmitting(true)
    try {
      const userAddress = userData?.profile?.stxAddress?.testnet
      if (!userAddress) {
        throw new Error('No wallet connected')
      }

      // In production, this would notify an admin/verifier to approve
      // For now, we'll store the request locally and show instructions
      const request = {
        user: userAddress,
        role: requestedRole,
        timestamp: Date.now(),
        txId: null // Would be populated after admin approval
      }

      localStorage.setItem(`medistacks.roleRequest.${requestedRole}`, JSON.stringify(request))
      setVerificationRequest(request)
      setStatus('submitted')

      toast({
        title: "Verification Request Submitted",
        description: "An admin will review your request shortly. You'll be notified once approved.",
      })

      // In a real implementation, this would send a notification to admins
      // or create an on-chain request that admins can view
    } catch (error) {
      console.error('Error submitting role request:', error)
      toast({
        title: "Error",
        description: "Failed to submit verification request",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const roleDisplayNames = {
    doctor: 'Healthcare Provider',
    researcher: 'Medical Researcher',
    emergency_responder: 'Emergency Responder'
  }

  const getStatusColor = () => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300'
      case 'submitted': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'denied': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'submitted': return <Clock className="h-5 w-5 text-yellow-600" />
      case 'denied': return <AlertCircle className="h-5 w-5 text-red-600" />
      default: return <UserCheck className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <Card className="medical-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Role Verification</CardTitle>
            <CardDescription>
              Verify your {roleDisplayNames[requestedRole]} role on the blockchain
            </CardDescription>
          </div>
          <Badge className={getStatusColor()}>
            <div className="flex items-center space-x-1">
              {getStatusIcon()}
              <span className="capitalize">{status}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'pending' && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Blockchain Registration Required</h4>
              <p className="text-sm text-blue-700">
                To access {requestedRole} features, your role must be verified and registered on the blockchain.
                This ensures secure, auditable access control for medical data.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">What happens next:</h4>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Submit your verification request</li>
                <li>An authorized verifier reviews your credentials</li>
                <li>Your role is registered on the blockchain</li>
                <li>You gain access to role-specific features</li>
              </ol>
            </div>

            <Button 
              onClick={submitRoleRequest}
              disabled={isSubmitting}
              className="medistacks-btn-primary w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Request Verification
                </>
              )}
            </Button>
          </>
        )}

        {status === 'submitted' && (
          <>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Verification Pending</h4>
              <p className="text-sm text-yellow-700">
                Your request has been submitted and is awaiting approval from an authorized verifier.
                This typically takes 1-2 business days.
              </p>
            </div>

            {verificationRequest && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Request ID:</span>
                  <span className="font-mono">{verificationRequest.user.slice(0, 8)}...{verificationRequest.user.slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submitted:</span>
                  <span>{new Date(verificationRequest.timestamp).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Role:</span>
                  <span className="capitalize">{requestedRole}</span>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                <strong>For Testing:</strong> Ask an admin to approve your role using the Admin Panel 
                at <code className="bg-gray-200 px-1 rounded">/app/admin-roles</code>
              </p>
            </div>
          </>
        )}

        {status === 'approved' && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Verification Complete</h4>
              <p className="text-sm text-green-700">
                Your {roleDisplayNames[requestedRole]} role has been verified and registered on the blockchain.
                You now have full access to all role-specific features.
              </p>
            </div>

            <Button 
              onClick={onComplete}
              className="medistacks-btn-primary w-full"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Continue to Dashboard
            </Button>
          </>
        )}

        {status === 'denied' && (
          <>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Verification Denied</h4>
              <p className="text-sm text-red-700">
                Your verification request was not approved. Please contact support for more information
                or submit additional documentation.
              </p>
            </div>

            <Button 
              onClick={() => setStatus('pending')}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default RoleVerification
