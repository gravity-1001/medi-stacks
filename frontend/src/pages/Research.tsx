import { useState, useEffect } from 'react'
import { useStacks } from '@/contexts/StacksContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  TrendingUp, 
  Coins, 
  FileText, 
  ShoppingCart,
  Calendar,
  User,
  Shield,
  DollarSign
} from 'lucide-react'
import { formatDate, formatSTX } from '@/lib/utils'
import { uintCV, principalCV } from '@stacks/transactions'

interface ResearchRecord {
  id: number
  title: string
  description: string
  owner: string
  price: number // in microSTX
  createdAt: number
  category: string
  anonymized: boolean
}

const Research = () => {
  const { callContractFunction, userData } = useStacks()
  const { isResearcher } = useAuth()
  const { toast } = useToast()
  const [records, setRecords] = useState<ResearchRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'medium' | 'high'>('all')

  const categories = [
    'all',
    'cardiology',
    'diabetes',
    'oncology',
    'neurology',
    'pediatrics',
    'mental-health'
  ]

  const loadResearchRecords = async () => {
    setLoading(true)
    try {
      // Mock data for demonstration
      const mockRecords: ResearchRecord[] = [
        {
          id: 1,
          title: 'Cardiac Health Data - Age 45-65',
          description: 'Anonymized cardiac health records including ECG, blood pressure, and cholesterol levels',
          owner: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          price: 500000, // 0.5 STX
          createdAt: Date.now() - 86400000,
          category: 'cardiology',
          anonymized: true
        },
        {
          id: 2,
          title: 'Diabetes Management Study Data',
          description: 'Long-term diabetes management data with HbA1c trends and medication responses',
          owner: 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
          price: 750000, // 0.75 STX
          createdAt: Date.now() - 172800000,
          category: 'diabetes',
          anonymized: true
        },
        {
          id: 3,
          title: 'Pediatric Growth Data',
          description: 'Growth charts and developmental milestones for pediatric research',
          owner: 'ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP',
          price: 300000, // 0.3 STX
          createdAt: Date.now() - 259200000,
          category: 'pediatrics',
          anonymized: true
        }
      ]
      setRecords(mockRecords)
    } catch (error) {
      console.error('Error loading research records:', error)
      toast({
        title: "Error",
        description: "Failed to load research records",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null)

  const purchaseResearchAccess = async (recordId: number, price: number) => {
    if (!isResearcher) {
      toast({
        title: "Error",
        description: "Only researchers can purchase access to research data",
        variant: "destructive"
      })
      return
    }

    try {
      setPurchaseLoading(recordId)
      const blockHeight = await callContractFunction('get-block-height', [])
      const expiryHeight = Number(blockHeight) + (30 * 144) // 30 days worth of blocks

      const txResult = await callContractFunction('buy-research-access', [
        uintCV(recordId),
        uintCV(expiryHeight),
        uintCV(price)
      ])

      if (txResult.success) {
        toast({
          title: "Success",
          description: "Research access purchased successfully. You can now access this dataset."
        })

        // Verify access was granted
        const hasAccess = await callContractFunction('has-access', [
          uintCV(recordId),
          principalCV(userData?.profile?.stxAddress?.testnet || '')
        ])

        if (hasAccess?.value?.allowed?.value === true) {
          // Record the access
          await callContractFunction('record-access', [uintCV(recordId)])
        }

        loadResearchRecords()
      } else {
        throw new Error('Transaction failed')
      }
    } catch (error: any) {
      console.error('Error purchasing research access:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to purchase research access. Please try again.",
        variant: "destructive"
      })
    } finally {
      setPurchaseLoading(null)
    }
  }

  useEffect(() => {
    loadResearchRecords()
  }, [])

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.category.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || record.category === selectedCategory
    
    const matchesPrice = priceRange === 'all' ||
                        (priceRange === 'low' && record.price < 500000) ||
                        (priceRange === 'medium' && record.price >= 500000 && record.price < 1000000) ||
                        (priceRange === 'high' && record.price >= 1000000)
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8EB] via-[#F3F8F7] to-[#F9F8EB] p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C40]">Research Marketplace</h1>
        <p className="text-[#2D4B43] mt-2">
          {isResearcher 
            ? "Purchase access to anonymized medical data for research purposes"
            : "Browse available research data (researcher role required to purchase)"
          }
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Records</CardTitle>
            <FileText className="h-4 w-4 text-medical-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records.length}</div>
            <p className="text-xs text-muted-foreground">
              Research datasets
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <Coins className="h-4 w-4 text-medical-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.length > 0 
                ? formatSTX(records.reduce((sum, r) => sum + r.price, 0) / records.length)
                : '0 STX'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per dataset
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-medical-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length - 1}</div>
            <p className="text-xs text-muted-foreground">
              Medical specialties
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search research data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
            </option>
          ))}
        </select>
        
        <select
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-medical-500"
        >
          <option value="all">All Prices</option>
          <option value="low">Low (&lt; 0.5 STX)</option>
          <option value="medium">Medium (0.5 - 1 STX)</option>
          <option value="high">High (&gt; 1 STX)</option>
        </select>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="medical-card p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading research records...</p>
          </Card>
        ) : filteredRecords.length === 0 ? (
          <Card className="medical-card p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Research Data Found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later for new datasets.
            </p>
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
                      <CardTitle className="text-lg">{record.title}</CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(record.createdAt)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Shield className="h-4 w-4" />
                          <span>Anonymized</span>
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-lg font-bold text-medical-600">
                      <DollarSign className="h-5 w-5" />
                      <span>{formatSTX(record.price)}</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-medical-100 text-medical-800 capitalize">
                      {record.category.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">{record.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>Data Provider: {record.owner.slice(0, 8)}...{record.owner.slice(-8)}</span>
                    </div>
                    
                    <Button
                      onClick={() => purchaseResearchAccess(record.id, record.price)}
                      variant="medical"
                      disabled={!isResearcher || purchaseLoading === record.id}
                      className="flex items-center space-x-2"
                    >
                      {purchaseLoading === record.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#F9F8EB] mr-2" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span>Purchase Access</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {!isResearcher && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        <Shield className="h-4 w-4 inline mr-1" />
                        You need researcher role to purchase access to research data.
                      </p>
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

export default Research
