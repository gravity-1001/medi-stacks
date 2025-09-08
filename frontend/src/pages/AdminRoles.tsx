import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStacks } from '@/contexts/StacksContext'
import { useAuth } from '@/contexts/AuthContext'
import { principalCV, stringAsciiCV, boolCV } from '@stacks/transactions'
import { Shield, Check, X } from 'lucide-react'

const AVAILABLE_ROLES = ['admin', 'verifier', 'doctor', 'researcher', 'emergency_responder'] as const

type Role = typeof AVAILABLE_ROLES[number]

const AdminRoles = () => {
  const { callContractFunction, callReadOnlyFunction } = useStacks()
  const { userRoles } = useAuth()
  const [addr, setAddr] = useState('')
  const [role, setRole] = useState<Role>('doctor')
  const [enabled, setEnabled] = useState(true)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [checks, setChecks] = useState<Record<string, boolean> | null>(null)

  const isAdmin = userRoles.includes('admin')

  const handleSetRole = async () => {
    if (!addr) return
    setLoading(true)
    setStatus(null)
    try {
      const res = await callContractFunction('set-role', [
        principalCV(addr),
        stringAsciiCV(role),
        boolCV(enabled),
      ])
      setStatus(`Transaction submitted: ${JSON.stringify(res)}`)
    } catch (e: any) {
      setStatus(`Error: ${e?.message || String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCheck = async () => {
    if (!addr) return
    const out: Record<string, boolean> = {}
    for (const r of AVAILABLE_ROLES) {
      try {
        const result: any = await callReadOnlyFunction('has-role', [
          principalCV(addr),
          stringAsciiCV(r),
        ])
        out[r] = !!(result?.value === true || result?.value?.value === true)
      } catch {
        out[r] = false
      }
    }
    setChecks(out)
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>Admin Only</CardTitle>
            <CardDescription>You need the admin role to manage roles.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Shield className="h-6 w-6 text-medical-600" />
            <div>
              <CardTitle>Role Management</CardTitle>
              <CardDescription>Grant or revoke roles by wallet address</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Wallet Address (ST...)</label>
            <Input value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="ST3..." className="medical-input" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full p-3 rounded-xl border-2 border-teal-300 bg-white"
              >
                {AVAILABLE_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Enabled</label>
              <select
                value={enabled ? 'true' : 'false'}
                onChange={(e) => setEnabled(e.target.value === 'true')}
                className="w-full p-3 rounded-xl border-2 border-teal-300 bg-white"
              >
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={handleSetRole} disabled={loading || !addr} className="medistacks-btn-primary medistacks-btn-md">
              {enabled ? <Check className="h-4 w-4 mr-2" /> : <X className="h-4 w-4 mr-2" />}
              {enabled ? 'Grant Role' : 'Revoke Role'}
            </Button>
            <Button onClick={handleCheck} className="medistacks-btn-secondary medistacks-btn-md">Check Roles</Button>
          </div>

          {status && (
            <div className="p-3 rounded-xl bg-lime-50 text-medical-700 border border-lime-300/50">
              <pre className="whitespace-pre-wrap break-words text-sm">{status}</pre>
            </div>
          )}

          {checks && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Current Roles</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {AVAILABLE_ROLES.map((r) => (
                  <div key={r} className="flex items-center justify-between p-2 bg-medical-50 rounded-lg border border-teal-200/50">
                    <span>{r}</span>
                    {checks[r] ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-500" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminRoles
