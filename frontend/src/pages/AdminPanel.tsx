import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useStacks } from '@/contexts/StacksContext'
import { useAuth } from '@/contexts/AuthContext'
import { principalCV, uintCV } from '@stacks/transactions'
import { Shield, DollarSign, Users, Activity, Settings, TrendingUp, AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AccessMetric {
  recordId: number
  accessor: string
  count: number
  lastHeight: number
}

const AdminPanel = () => {
  const { callContractFunction, callReadOnlyFunction, userData } = useStacks()
  const { userRoles } = useAuth()
  const { toast } = useToast()
  
  const [newAdmin, setNewAdmin] = useState('')
  const [platformFeeBps, setPlatformFeeBps] = useState('')
  const [feeRecipient, setFeeRecipient] = useState('')
  const [metrics, setMetrics] = useState<AccessMetric[]>([])
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isAdmin = userRoles.includes('admin')
  const userAddress = userData?.profile?.stxAddress?.testnet

  useEffect(() => {
    if (isAdmin) {
      loadAccessMetrics()
    }
  }, [isAdmin])

  const loadAccessMetrics = async () => {
    setLoadingMetrics(true)
    try {
      const allMetrics: AccessMetric[] = []
      
      // Check metrics for a range of records and accessors
      const recordIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const potentialAccessors = [
        'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG', 
        'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP',
        userAddress
      ].filter(Boolean)

      for (const recordId of recordIds) {
        for (const accessor of potentialAccessors) {
          try {
            const result = await callReadOnlyFunction('get-access-metrics', [
              uintCV(recordId),
              principalCV(accessor as string)
            ])

            if (result?.value) {
              const count = result.value.count?.value || 0
              const lastHeight = result.value['last-height']?.value || 0
              
              if (count > 0) {
                allMetrics.push({
                  recordId,
                  accessor: accessor as string,
                  count: Number(count),
                  lastHeight: Number(lastHeight)
                })
              }
            }
          } catch (error) {
            // No metrics for this combination
            console.debug(`No metrics for record ${recordId}, accessor ${accessor}`)
          }
        }
      }

      setMetrics(allMetrics)
    } catch (error) {
      console.error('Error loading access metrics:', error)
      toast({
        title: "Error",
        description: "Failed to load access metrics",
        variant: "destructive"
      })
    } finally {
      setLoadingMetrics(false)
    }
  }

  const handleSetAdmin = async () => {
    if (!newAdmin) return
    
    setIsSubmitting(true)
    try {
      await callContractFunction('set-admin', [
        principalCV(newAdmin)
      ])

      toast({
        title: "Success",
        description: `Admin rights transferred to ${newAdmin.slice(0, 8)}...${newAdmin.slice(-6)}`
      })
      
      setNewAdmin('')
    } catch (error) {
      console.error('Error setting admin:', error)
      toast({
        title: "Error",
        description: "Failed to transfer admin rights",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetPlatformFee = async () => {
    if (!platformFeeBps) return
    
    const bps = parseInt(platformFeeBps)
    if (isNaN(bps) || bps < 0 || bps > 10000) {
      toast({
        title: "Error",
        description: "Fee must be between 0 and 10000 basis points (0-100%)",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    try {
      await callContractFunction('set-platform-fee-bps', [
        uintCV(bps)
      ])

      toast({
        title: "Success",
        description: `Platform fee set to ${bps / 100}%`
      })
      
      setPlatformFeeBps('')
    } catch (error) {
      console.error('Error setting platform fee:', error)
      toast({
        title: "Error",
        description: "Failed to set platform fee",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSetFeeRecipient = async () => {
    if (!feeRecipient) return
    
    setIsSubmitting(true)
    try {
      await callContractFunction('set-fee-recipient', [
        principalCV(feeRecipient)
      ])

      toast({
        title: "Success",
        description: `Fee recipient updated to ${feeRecipient.slice(0, 8)}...${feeRecipient.slice(-6)}`
      })
      
      setFeeRecipient('')
    } catch (error) {
      console.error('Error setting fee recipient:', error)
      toast({
        title: "Error",
        description: "Failed to set fee recipient",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="medical-card">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Admin Access Required</h3>
            <p className="text-gray-600">
              You need admin privileges to access this panel.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          Manage platform settings and view system metrics
        </p>
      </div>

      {/* Admin Functions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="medical-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-medical-600" />
              <div>
                <CardTitle>Transfer Admin</CardTitle>
                <CardDescription>Transfer admin rights to another address</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Admin Address</label>
              <Input
                value={newAdmin}
                onChange={(e) => setNewAdmin(e.target.value)}
                placeholder="ST..."
                className="medical-input mt-1"
              />
            </div>
            <Button
              onClick={handleSetAdmin}
              disabled={!newAdmin || isSubmitting}
              className="medistacks-btn-primary w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Transfer Admin Rights
            </Button>
            <p className="text-xs text-red-600">
              ⚠️ Warning: This action is irreversible
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6 text-medical-600" />
              <div>
                <CardTitle>Platform Fee</CardTitle>
                <CardDescription>Set research marketplace fee</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Fee (basis points)</label>
              <Input
                value={platformFeeBps}
                onChange={(e) => setPlatformFeeBps(e.target.value)}
                placeholder="e.g. 250 for 2.5%"
                type="number"
                min="0"
                max="10000"
                className="medical-input mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                100 bps = 1% | Max: 10000 bps (100%)
              </p>
            </div>
            <Button
              onClick={handleSetPlatformFee}
              disabled={!platformFeeBps || isSubmitting}
              className="medistacks-btn-primary w-full"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Update Platform Fee
            </Button>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-medical-600" />
              <div>
                <CardTitle>Fee Recipient</CardTitle>
                <CardDescription>Set fee collection address</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Recipient Address</label>
              <Input
                value={feeRecipient}
                onChange={(e) => setFeeRecipient(e.target.value)}
                placeholder="ST..."
                className="medical-input mt-1"
              />
            </div>
            <Button
              onClick={handleSetFeeRecipient}
              disabled={!feeRecipient || isSubmitting}
              className="medistacks-btn-primary w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Update Recipient
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Access Metrics */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-6 w-6 text-medical-600" />
              <div>
                <CardTitle>Access Metrics</CardTitle>
                <CardDescription>System-wide access audit trail</CardDescription>
              </div>
            </div>
            <Button
              onClick={loadAccessMetrics}
              variant="outline"
              size="sm"
              disabled={loadingMetrics}
            >
              {loadingMetrics ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingMetrics ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading access metrics...</p>
            </div>
          ) : metrics.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Record ID</th>
                    <th className="text-left py-2">Accessor</th>
                    <th className="text-left py-2">Access Count</th>
                    <th className="text-left py-2">Last Access</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">
                        <Badge variant="secondary">#{metric.recordId}</Badge>
                      </td>
                      <td className="py-2 font-mono text-xs">
                        {metric.accessor.slice(0, 8)}...{metric.accessor.slice(-6)}
                      </td>
                      <td className="py-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {metric.count} access{metric.count !== 1 ? 'es' : ''}
                        </Badge>
                      </td>
                      <td className="py-2 text-gray-600">
                        Block #{metric.lastHeight}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No access metrics found</p>
              <p className="text-xs mt-1">Metrics are recorded when users call record-access</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accesses</CardTitle>
            <Activity className="h-4 w-4 text-medical-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.reduce((sum, m) => sum + m.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all records
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Records</CardTitle>
            <Settings className="h-4 w-4 text-medical-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(metrics.map(m => m.recordId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              With access metrics
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Accessors</CardTitle>
            <Users className="h-4 w-4 text-medical-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(metrics.map(m => m.accessor)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Healthcare providers
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminPanel
