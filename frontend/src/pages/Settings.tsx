import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStacks } from '@/contexts/StacksContext'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { 
  User, 
  Shield, 
  Coins, 
  Bell,
  Key,
  Trash2,
  Save,
  RefreshCw
} from 'lucide-react'
import { roleToDisplayName } from '@/lib/utils'

const Settings = () => {
  const { userData, signOut } = useStacks()
  const { userRoles, refreshUserRoles, isAdmin } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      accessRequests: true,
      researchOffers: true,
      emergencyAlerts: true,
      systemUpdates: false
    },
    privacy: {
      showProfile: false,
      allowResearchContact: true,
      shareAnonymizedData: true
    },
    platformFee: 250 // 2.5% in basis points
  })

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // In a real implementation, save settings to blockchain or backend
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock delay
      
      toast({
        title: "Settings Saved",
        description: "Your preferences have been updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshRoles = async () => {
    setLoading(true)
    try {
      await refreshUserRoles()
      toast({
        title: "Roles Refreshed",
        description: "Your role permissions have been updated"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh roles",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F8EB] via-[#F3F8F7] to-[#F9F8EB] p-8 space-y-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-[#A7D7C5]/20 rounded-full blur-xl"
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-24 h-24 bg-[#74B49B]/20 rounded-full blur-lg"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 left-1/4 w-48 h-48 bg-[#5C8D89]/10 rounded-full blur-xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 border border-[#1A3C40]/10 shadow-md">
        <h1 className="text-3xl font-bold text-[#1A3C40]">Settings</h1>
        <p className="text-[#2D4B43] mt-2">Manage your account preferences and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Profile Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-[#2D4B43]" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>
              Your account and wallet information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <Input
                value={userData?.profile?.name || 'Anonymous User'}
                disabled
                className="bg-[#F9F8EB]/50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address
              </label>
              <Input
                value={userData?.profile?.stxAddress?.testnet || 'Not connected'}
                disabled
                className="bg-[#F9F8EB]/50 font-mono text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network
              </label>
              <Input
                value="Stacks Testnet"
                disabled
                className="bg-[#F9F8EB]/50"
              />
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1A3C40]">Show Profile Publicly</span>
                <input
                  type="checkbox"
                  checked={settings.privacy.showProfile}
                  onChange={(e) => setSettings({
                    ...settings,
                    privacy: { ...settings.privacy, showProfile: e.target.checked }
                  })}
                  className="rounded border-gray-300"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Management */}
        <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-[#2D4B43]" />
              <span>Role Permissions</span>
            </CardTitle>
            <CardDescription>
              Your current roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {userRoles.length > 0 ? (
                userRoles.map((role) => (
                  <div key={role} className="flex items-center justify-between p-3 bg-[#F9F8EB] rounded-lg border border-[#1A3C40]/10">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-medical-600" />
                      <span className="font-medium">{roleToDisplayName(role)}</span>
                    </div>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-[#2D4B43]">
                  No roles assigned
                </div>
              )}
            </div>
            
            <Button
              onClick={handleRefreshRoles}
              variant="outline"
              size="sm"
              disabled={loading}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Roles
            </Button>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <Shield className="h-4 w-4 inline mr-1" />
                Roles are managed by administrators and verifiers. Contact support if you need role changes.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-[#2D4B43]" />
              <span>Notifications</span>
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#1A3C40] mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, [key]: e.target.checked }
                  })}
                  className="rounded border-gray-300"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-[#2D4B43]" />
              <span>Privacy & Data</span>
            </CardTitle>
            <CardDescription>
              Control how your data is used and shared
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-[#1A3C40]">Allow Research Contact</span>
                <p className="text-xs text-[#2D4B43]">Researchers can contact you for studies</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.allowResearchContact}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, allowResearchContact: e.target.checked }
                })}
                className="rounded border-gray-300"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-[#1A3C40]">Share Anonymized Data</span>
                <p className="text-xs text-[#2D4B43]">Help improve healthcare research</p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.shareAnonymizedData}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, shareAnonymizedData: e.target.checked }
                })}
                className="rounded border-gray-300"
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <Key className="h-4 w-4 inline mr-1" />
                All data sharing is completely anonymized and encrypted. You maintain full control.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings (Admin Only) */}
        {isAdmin && (
          <Card className="bg-white/80 backdrop-blur-sm border border-[#1A3C40]/10 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-[#2D4B43]" />
                <span>Platform Settings</span>
              </CardTitle>
              <CardDescription>
                Administrative settings for the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Fee (Basis Points)
                </label>
                <Input
                  type="number"
                  value={settings.platformFee}
                  onChange={(e) => setSettings({
                    ...settings,
                    platformFee: Number(e.target.value)
                  })}
                  min="0"
                  max="10000"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current: {(settings.platformFee / 100).toFixed(2)}% fee on research purchases
                </p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Admin settings affect all platform users. Use with caution.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="bg-white/80 backdrop-blur-sm border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Disconnect Wallet</h4>
              <p className="text-sm text-red-700 mb-3">
                This will sign you out and disconnect your wallet from the application.
              </p>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Disconnect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          className="bg-[#1A3C40] hover:bg-[#2D4B43] text-[#F9F8EB] px-6 py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
          disabled={loading}
        >
          <Save className="h-4 w-4" />
          <span>{loading ? 'Saving...' : 'Save Settings'}</span>
        </Button>
      </div>
    </div>
  )
}

export default Settings
