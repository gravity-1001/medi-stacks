import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { TrendingUp, Database, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useStacks } from '@/contexts/StacksContext'
import { uintCV, principalCV } from '@stacks/transactions'

const ResearcherDashboard = () => {
  const navigate = useNavigate()
  const { callContractFunction, callReadOnlyFunction, userData } = useStacks()
  const [buy, setBuy] = useState({ recordId: '', expiry: '', amount: '' })
  const [checkRecordId, setCheckRecordId] = useState('')
  const [status, setStatus] = useState<string | null>(null)
  return (
    <div className="space-y-8">
      <motion.div 
        className="relative bg-gradient-to-r from-[#5C8D89]/90 via-[#74B49B]/80 to-[#5C8D89]/90 rounded-3xl p-10 text-[#F9F8EB] border-4 border-[#A7D7C5]/30 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black mb-2">MediStacks Research</h1>
        <p className="text-[#F9F8EB]/80">Access anonymized datasets and manage purchases.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/10 border border-[#74B49B]/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Marketplace</CardTitle>
            <CardDescription>Browse available datasets</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/research')} className="bg-[#74B49B] hover:bg-[#5C8D89] text-[#F9F8EB] px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              <TrendingUp className="h-4 w-4 mr-2" /> Open Marketplace
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/10 border border-[#74B49B]/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>My Datasets</CardTitle>
            <CardDescription>View purchased access</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/research')} className="bg-[#A7D7C5] hover:bg-[#74B49B] text-[#5C8D89] hover:text-[#F9F8EB] px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              <Database className="h-4 w-4 mr-2" /> View Datasets
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/10 border border-[#74B49B]/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Earnings</CardTitle>
            <CardDescription>Track spending and grants</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/app/research')} className="bg-[#A7D7C5] hover:bg-[#74B49B] text-[#5C8D89] hover:text-[#F9F8EB] px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              <Coins className="h-4 w-4 mr-2" /> View Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/10 border border-[#74B49B]/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Buy Research Access</CardTitle>
            <CardDescription>Purchase access to an opted-in record</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Record ID</label>
                <Input value={buy.recordId} onChange={(e) => setBuy({ ...buy, recordId: e.target.value })} className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89] focus:border-[#5C8D89] focus:ring-[#5C8D89]" />
              </div>
              <div>
                <label className="text-sm font-medium">Expiry height (0=none)</label>
                <Input value={buy.expiry} onChange={(e) => setBuy({ ...buy, expiry: e.target.value })} className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89] focus:border-[#5C8D89] focus:ring-[#5C8D89]" />
              </div>
              <div>
                <label className="text-sm font-medium">Amount (uSTX)</label>
                <Input value={buy.amount} onChange={(e) => setBuy({ ...buy, amount: e.target.value })} className="bg-[#F9F8EB] border-[#74B49B]/30 text-[#5C8D89] focus:border-[#5C8D89] focus:ring-[#5C8D89]" />
              </div>
            </div>
            <Button
              className="bg-[#74B49B] hover:bg-[#5C8D89] text-[#F9F8EB] px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              disabled={!buy.recordId || !buy.amount}
              onClick={async () => {
                try {
                  setStatus(null)
                  const res = await callContractFunction('buy-research-access', [
                    uintCV(Number(buy.recordId || '0')),
                    uintCV(Number(buy.expiry || '0')),
                    uintCV(Number(buy.amount || '0')),
                  ])
                  setStatus(`Purchase submitted: ${JSON.stringify(res)}`)
                } catch (e: any) {
                  setStatus(`Error: ${e?.message || String(e)}`)
                }
              }}
            >
              Purchase
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#F9F8EB] to-[#A7D7C5]/10 border border-[#74B49B]/30 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Check Permission</CardTitle>
            <CardDescription>Verify your access to a record</CardDescription>
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

      {status && (
        <div className="p-4 rounded-xl bg-[#F9F8EB] border border-[#74B49B]/30 text-[#5C8D89]">
          <pre className="whitespace-pre-wrap break-words text-sm">{status}</pre>
        </div>
      )}
    </div>
  )
}

export default ResearcherDashboard
