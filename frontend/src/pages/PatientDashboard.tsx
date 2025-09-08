import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { FileText, Shield, Bell, Database, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useStacks } from '@/contexts/StacksContext'
import { uintCV, principalCV, stringAsciiCV } from '@stacks/transactions'

interface Permission {
  recordId: number
  accessor: string
  expiryHeight: number
  grantedBy: string
  roleScope: string
}

const PatientDashboard = () => {
  const navigate = useNavigate()
  const { callContractFunction, callReadOnlyFunction, userData } = useStacks()
  const [emerExpiry, setEmerExpiry] = useState('')
  const [approve, setApprove] = useState({ recordId: '', accessor: '', expiry: '', scope: 'doctor' })
  const [deny, setDeny] = useState({ recordId: '', requester: '' })
  const [status, setStatus] = useState<string | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loadingPermissions, setLoadingPermissions] = useState(false)

  useEffect(() => {
    loadCurrentPermissions()
  }, [userData])

  const loadCurrentPermissions = async () => {
    setLoadingPermissions(true)
    try {
      const userAddress = userData?.profile?.stxAddress?.testnet
      if (!userAddress) return

      const foundPermissions: Permission[] = []
      // Check permissions for user's records (demo range)
      const recordIds = [1, 2, 3, 4, 5]
      const potentialAccessors = [
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP'
      ]

      for (const recordId of recordIds) {
        // First check if user owns this record
        const recordInfo = await callReadOnlyFunction('get-record', [uintCV(recordId)])
        if (recordInfo?.value?.owner?.value === userAddress) {
          // Check permissions for each potential accessor
          for (const accessor of potentialAccessors) {
            const permission = await callReadOnlyFunction('get-permission', [
              uintCV(recordId),
              principalCV(accessor)
            ])

            if (permission?.value) {
              const expiry = permission.value['expiry-height']?.value || 0
              const grantedBy = permission.value['granted-by']?.value || userAddress
              const roleScope = permission.value['role-scope']?.value || 'general'

              // Check if permission is still valid
              const hasAccess = await callReadOnlyFunction('has-access', [
                uintCV(recordId),
                principalCV(accessor)
              ])

              if (hasAccess?.value?.allowed?.value === true) {
                foundPermissions.push({
                  recordId,
                  accessor,
                  expiryHeight: Number(expiry),
                  grantedBy,
                  roleScope
                })
              }
            }
          }
        }
      }

      setPermissions(foundPermissions)
    } catch (error) {
      console.error('Error loading permissions:', error)
    } finally {
      setLoadingPermissions(false)
    }
  }

  const handleRevokeAccess = async (recordId: number, accessor: string) => {
    try {
      setStatus(null)
      const res = await callContractFunction('revoke-access', [
        uintCV(recordId),
        principalCV(accessor)
      ])
      setStatus(`Access revoked: ${JSON.stringify(res)}`)
      loadCurrentPermissions() // Reload permissions
    } catch (e: any) {
      setStatus(`Error: ${e?.message || String(e)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8EB] via-[#F3F8F7] to-[#F9F8EB] p-8 space-y-8">
      <motion.div 
        className="relative bg-gradient-to-br from-[#A7D7C5] to-[#74B49B] rounded-3xl p-10 text-[#1A3C40] shadow-lg overflow-hidden backdrop-blur-sm border border-[#1A3C40]/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black text-[#1A3C40] mb-4 relative z-10">Welcome Back!</h1>
        <p className="text-[#1A3C40]/90 text-lg relative z-10">Your health data is secure and under your complete control.</p>
        <div className="mt-6 grid grid-cols-3 gap-4 relative z-10">
          <div className="flex items-center justify-center p-3 bg-[#F9F8EB]/60 rounded-lg backdrop-blur-sm text-[#1A3C40] hover:bg-[#F9F8EB]/80 transition-all duration-300 group">
            <FileText className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
            <span>3 Records</span>
          </div>
          <div className="flex items-center justify-center p-3 bg-[#F9F8EB]/60 rounded-lg backdrop-blur-sm text-[#1A3C40] hover:bg-[#F9F8EB]/80 transition-all duration-300 group">
            <Shield className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
            <span>{permissions.length} Active Permissions</span>
          </div>
          <div className="flex items-center justify-center p-3 bg-[#F9F8EB]/60 rounded-lg backdrop-blur-sm text-[#1A3C40] hover:bg-[#F9F8EB]/80 transition-all duration-300 group">
            <Bell className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
            <span>1 Pending Request</span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-[#1A3C40]/30">
          <CardHeader>
            <CardTitle>My Records</CardTitle>
            <CardDescription>Your encrypted medical files</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/records')} className="bg-[#1A3C40] hover:bg-[#2D4B43] text-[#F9F8EB] w-full px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-[1.02]">
              <FileText className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" /> View Records
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-[#1A3C40]/30">
          <CardHeader>
            <CardTitle>Consent Policies</CardTitle>
            <CardDescription>Control data access permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/consent-policies')} className="bg-[#2D4B43] hover:bg-[#1A3C40] text-[#F9F8EB] w-full px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-[1.02]">
              <Shield className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" /> Manage Policies
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-[#1A3C40]/30">
          <CardHeader>
            <CardTitle>Access Requests</CardTitle>
            <CardDescription>Approve or deny data requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/access-requests')} className="bg-[#2D4B43] hover:bg-[#1A3C40] text-[#F9F8EB] w-full px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-[1.02]">
              <Bell className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" /> View Requests
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-[#1A3C40]/30">
          <CardHeader>
            <CardTitle>Research Hub</CardTitle>
            <CardDescription>Participate in studies & earn STX</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/research')} className="bg-[#1A3C40] hover:bg-[#2D4B43] text-[#F9F8EB] w-full px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-[1.02]">
              <Database className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform duration-300" /> Browse Studies
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-[#1A3C40]/30">
          <CardHeader>
            <CardTitle>Current Access Permissions</CardTitle>
            <CardDescription>Manage who has access to your records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingPermissions ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#1A3C40]/20 border-t-[#1A3C40] mx-auto"></div>
              </div>
            ) : permissions.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {permissions.map((perm, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-[#F9F8EB] rounded-lg border border-[#1A3C40]/10 hover:border-[#1A3C40]/30 transition-all duration-300">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#1A3C40]">Record #{perm.recordId}</div>
                      <div className="text-xs text-[#1A3C40]/70 truncate">
                        {perm.accessor.slice(0, 8)}...{perm.accessor.slice(-6)}
                      </div>
                      <div className="text-xs text-[#1A3C40]/60">
                        Role: {perm.roleScope} | 
                        {perm.expiryHeight === 0 ? ' Permanent' : ` Expires: ${perm.expiryHeight}`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRevokeAccess(perm.recordId, perm.accessor)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#1A3C40]/70 text-center py-4">No active permissions found</p>
            )}
            <Button 
              onClick={loadCurrentPermissions} 
              variant="outline" 
              className="w-full mt-2 border-[#1A3C40]/20 text-[#1A3C40] hover:bg-[#1A3C40]/5"
            >
              Refresh Permissions
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-[#1A3C40]/30">
          <CardHeader>
            <CardTitle>Enable Emergency Access</CardTitle>
            <CardDescription>Temporarily allow ER responders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="text-sm font-medium text-[#1A3C40]">Expiry block height</label>
            <Input value={emerExpiry} onChange={(e) => setEmerExpiry(e.target.value)} placeholder="e.g. 123456" className="bg-[#F9F8EB] border-[#1A3C40]/20 text-[#1A3C40] focus:border-[#1A3C40] focus:ring-[#1A3C40] placeholder-[#1A3C40]/50" />
            <Button
              className="bg-[#1A3C40] hover:bg-[#2D4B43] text-[#F9F8EB] w-full px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-[1.02]"
              onClick={async () => {
                try {
                  setStatus(null)
                  const res = await callContractFunction('enable-emergency', [uintCV(Number(emerExpiry || '0'))])
                  setStatus(`Emergency enabled: ${JSON.stringify(res)}`)
                } catch (e: any) {
                  setStatus(`Error: ${e?.message || String(e)}`)
                }
              }}
              disabled={!emerExpiry}
            >
              Enable
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300 group hover:border-[#1A3C40]/30">
        <CardHeader>
          <CardTitle>Approve/Deny Access</CardTitle>
          <CardDescription>Control who can view a record</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-[#1A3C40]">Record ID</label>
              <Input value={approve.recordId} onChange={(e) => setApprove({ ...approve, recordId: e.target.value })} className="bg-[#F9F8EB] border-[#1A3C40]/20 text-[#1A3C40] focus:border-[#1A3C40] focus:ring-[#1A3C40] placeholder-[#1A3C40]/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A3C40]">Accessor (STX address)</label>
              <Input value={approve.accessor} onChange={(e) => setApprove({ ...approve, accessor: e.target.value })} className="bg-[#F9F8EB] border-[#1A3C40]/20 text-[#1A3C40] focus:border-[#1A3C40] focus:ring-[#1A3C40] placeholder-[#1A3C40]/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A3C40]">Expiry height (0 = none)</label>
              <Input value={approve.expiry} onChange={(e) => setApprove({ ...approve, expiry: e.target.value })} className="bg-[#F9F8EB] border-[#1A3C40]/20 text-[#1A3C40] focus:border-[#1A3C40] focus:ring-[#1A3C40] placeholder-[#1A3C40]/50" />
            </div>
            <div>
              <label className="text-sm font-medium text-[#1A3C40]">Scope (doctor/research)</label>
              <Input value={approve.scope} onChange={(e) => setApprove({ ...approve, scope: e.target.value })} className="bg-[#F9F8EB] border-[#1A3C40]/20 text-[#1A3C40] focus:border-[#1A3C40] focus:ring-[#1A3C40] placeholder-[#1A3C40]/50" />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              className="bg-[#1A3C40] hover:bg-[#2D4B43] text-[#F9F8EB] px-6 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
              onClick={async () => {
                try {
                  setStatus(null)
                  const res = await callContractFunction('approve-access', [
                    uintCV(Number(approve.recordId || '0')),
                    principalCV(approve.accessor),
                    uintCV(Number(approve.expiry || '0')),
                    stringAsciiCV(approve.scope),
                  ])
                  setStatus(`Approved: ${JSON.stringify(res)}`)
                } catch (e: any) {
                  setStatus(`Error: ${e?.message || String(e)}`)
                }
              }}
              disabled={!approve.recordId || !approve.accessor}
            >
              Approve
            </Button>
            <div className="flex-1" />
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
              <Input placeholder="Record ID" value={deny.recordId} onChange={(e) => setDeny({ ...deny, recordId: e.target.value })} className="bg-[#F9F8EB] border-[#1A3C40]/20 text-[#1A3C40] focus:border-[#1A3C40] focus:ring-[#1A3C40] placeholder-[#1A3C40]/50" />
              <Input placeholder="Requester STX" value={deny.requester} onChange={(e) => setDeny({ ...deny, requester: e.target.value })} className="bg-[#F9F8EB] border-[#1A3C40]/20 text-[#1A3C40] focus:border-[#1A3C40] focus:ring-[#1A3C40] placeholder-[#1A3C40]/50" />
            </div>
            <Button
              className="bg-[#2D4B43] hover:bg-[#1A3C40] text-[#F9F8EB] px-6 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
              onClick={async () => {
                try {
                  setStatus(null)
                  const res = await callContractFunction('deny-access', [
                    uintCV(Number(deny.recordId || '0')),
                    principalCV(deny.requester),
                  ])
                  setStatus(`Denied: ${JSON.stringify(res)}`)
                } catch (e: any) {
                  setStatus(`Error: ${e?.message || String(e)}`)
                }
              }}
              disabled={!deny.recordId || !deny.requester}
            >
              Deny
            </Button>
          </div>
        </CardContent>
      </Card>

      {status && (
        <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 text-[#1A3C40]">
          <pre className="whitespace-pre-wrap break-words text-sm">{status}</pre>
        </div>
      )}
    </div>
  )
}

export default PatientDashboard
