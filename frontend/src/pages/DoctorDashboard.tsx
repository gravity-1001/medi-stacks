import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, FileSearch, ClipboardCheck, Stethoscope, QrCode, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useStacks } from '@/contexts/StacksContext'
import { uintCV, someCV, noneCV, stringUtf8CV, principalCV } from '@stacks/transactions'

const DoctorDashboard = () => {
  const navigate = useNavigate()
  const { callContractFunction, callReadOnlyFunction, userData } = useStacks()
  const [request, setRequest] = useState({ recordId: '', purpose: '' })
  const [checkRecordId, setCheckRecordId] = useState('')
  const [logRecordId, setLogRecordId] = useState('')
  const [patientPrincipal, setPatientPrincipal] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  return (
    <div className="space-y-8">
      <motion.div 
        className="relative bg-gradient-to-r from-[#5C8D89]/90 via-[#74B49B]/80 to-[#5C8D89]/90 rounded-3xl p-10 text-[#F9F8EB] border-4 border-[#A7D7C5]/30 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-3">
          <Stethoscope className="h-8 w-8 text-lime-300" />
          <h1 className="text-4xl font-black mb-2">Doctor Workspace</h1>
        </div>
        <p className="text-[#F9F8EB]/80">Request access, view patient records, and log clinical access securely.</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/10 border border-[#74B49B]/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Access Requests</CardTitle>
            <CardDescription>Approve or deny pending requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/access-requests')} className="bg-[#74B49B] hover:bg-[#5C8D89] text-[#F9F8EB] px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              <ClipboardCheck className="h-4 w-4 mr-2" /> Review Requests
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/10 border border-[#74B49B]/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>Search and view authorized records</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/records')} className="bg-[#A7D7C5] hover:bg-[#74B49B] text-[#5C8D89] hover:text-[#F9F8EB] px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              <FileSearch className="h-4 w-4 mr-2" /> Browse Records
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/10 border border-[#74B49B]/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Patient Lookup</CardTitle>
            <CardDescription>Find a patient by wallet address</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                placeholder="Patient principal (ST...)"
                value={patientPrincipal}
                onChange={(e) => setPatientPrincipal(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={() => navigate('/app/records')} className="bg-[#A7D7C5] hover:bg-[#74B49B] text-[#5C8D89] hover:text-[#F9F8EB] px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                  <Users className="h-4 w-4 mr-2" /> View Authorized Records
                </Button>
                <Button onClick={() => navigate('/app/access-requests')} variant="outline" className="medistacks-btn-md">
                  Request Access
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/10 border border-[#74B49B]/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Request Record Access</CardTitle>
            <CardDescription>Ask the patient to approve access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="text-sm font-medium">Record ID</label>
            <Input value={request.recordId} onChange={(e) => setRequest({ ...request, recordId: e.target.value })} className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89] focus:border-[#5C8D89] focus:ring-[#5C8D89]" />
            <label className="text-sm font-medium">Purpose (optional)</label>
            <Input value={request.purpose} onChange={(e) => setRequest({ ...request, purpose: e.target.value })} className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89] focus:border-[#5C8D89] focus:ring-[#5C8D89]" />
            <Button
              className="bg-[#74B49B] hover:bg-[#5C8D89] text-[#F9F8EB] px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              disabled={!request.recordId}
              onClick={async () => {
                try {
                  setStatus(null)
                  const args: any[] = [uintCV(Number(request.recordId))]
                  if (request.purpose.trim()) {
                    // optional string-utf8  -> some("...")
                    args.push(someCV(stringUtf8CV(request.purpose.trim())))
                  } else {
                    // none optional
                    args.push(noneCV())
                  }
                  const res = await callContractFunction('request-access', args)
                  setStatus(`Request submitted: ${JSON.stringify(res)}`)
                } catch (e: any) {
                  setStatus(`Error: ${e?.message || String(e)}`)
                }
              }}
            >
              Submit Request
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/10 border border-[#74B49B]/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Check Permission</CardTitle>
            <CardDescription>Verify current access status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="text-sm font-medium">Record ID</label>
            <Input value={checkRecordId} onChange={(e) => setCheckRecordId(e.target.value)} className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89] focus:border-[#5C8D89] focus:ring-[#5C8D89]" />
            <Button
              className="bg-[#A7D7C5] hover:bg-[#74B49B] text-[#5C8D89] hover:text-[#F9F8EB] px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              disabled={!checkRecordId}
              onClick={async () => {
                try {
                  setStatus(null)
                  const accessor = userData?.profile?.stxAddress?.testnet
                  const result: any = await callReadOnlyFunction('has-access', [
                    uintCV(Number(checkRecordId)),
                    principalCV(accessor),
                  ])
                  setStatus(`Permission result: ${JSON.stringify(result)}`)
                } catch (e: any) {
                  setStatus(`Error: ${e?.message || String(e)}`)
                }
              }}
            >
              Check
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/10 border border-[#74B49B]/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Log Clinical Access</CardTitle>
            <CardDescription>Record audited access to a patient record</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="text-sm font-medium">Record ID</label>
            <Input value={logRecordId} onChange={(e) => setLogRecordId(e.target.value)} className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89] focus:border-[#5C8D89] focus:ring-[#5C8D89]" />
            <Button
              className="bg-[#A7D7C5] hover:bg-[#74B49B] text-[#5C8D89] hover:text-[#F9F8EB] px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              disabled={!logRecordId}
              onClick={async () => {
                try {
                  setStatus(null)
                  // record-access(record-id)
                  const res = await callContractFunction('record-access', [uintCV(Number(logRecordId))])
                  setStatus(`Access logged: ${JSON.stringify(res)}`)
                } catch (e: any) {
                  setStatus(`Error: ${e?.message || String(e)}`)
                }
              }}
            >
              <Activity className="h-4 w-4 mr-2" /> Log Access
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/10 border border-[#74B49B]/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Scan Patient QR</CardTitle>
            <CardDescription>Quickly open a patient profile from a QR code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <QrCode className="h-8 w-8" />
              <p className="text-[#F9F8EB]">Coming soon: scan a patient QR to auto-fill their wallet address and view authorized records.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {status && (
        <div className="p-4 rounded-xl bg-[#F9F8EB] border border-[#74B49B]/30 text-[#5C8D89]">
          <pre className="whitespace-pre-wrap break-words text-sm">{status}</pre>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard
