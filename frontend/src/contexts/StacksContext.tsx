import React, { createContext, useContext, useEffect, useState } from 'react'
import { AppConfig, UserSession, showConnect, openContractCall } from '@stacks/connect'
import { StacksTestnet, StacksMainnet } from '@stacks/network'
import {
  callReadOnlyFunction as stacksCallReadOnlyFunction,
  PostConditionMode,
  AnchorMode
} from '@stacks/transactions'

interface StacksContextType {
  userSession: UserSession
  userData: any
  isSignedIn: boolean
  network: StacksTestnet | StacksMainnet
  contractAddress: string
  contractName: string
  connectWallet: () => void
  signOut: () => void
  callContractFunction: (functionName: string, functionArgs: any[], postConditions?: any[]) => Promise<any>
  callReadOnlyFunction: (functionName: string, functionArgs: any[]) => Promise<any>
}

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

const StacksContext = createContext<StacksContextType | undefined>(undefined)

export const useStacks = () => {
  const context = useContext(StacksContext)
  if (!context) {
    throw new Error('useStacks must be used within a StacksProvider')
  }
  return context
}

export const StacksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<any>(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  
  // Use Vite proxy in browser to avoid CORS; fallback to direct Hiro URL elsewhere
  const apiUrl = typeof window !== 'undefined' ? '/stacks-api' : 'https://api.testnet.hiro.so'
  const network = new StacksTestnet({ url: apiUrl })
  const contractAddress = 'ST3A27SWZ1V55S98N8ET07XYTC3D61QNQAT3DSMEN'
  const contractName = 'medistacks1'

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setUserData(userData)
        setIsSignedIn(true)
      })
    } else if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData())
      setIsSignedIn(true)
    }
  }, [])

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'MediStacks',
        icon: '/medical-icon.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        window.location.reload()
      },
      userSession,
    })
  }

  const signOut = () => {
    userSession.signUserOut()
    setUserData(null)
    setIsSignedIn(false)
    window.location.href = '/'
  }

  const callContractFunction = async (
    functionName: string,
    functionArgs: any[],
    postConditions: any[] = []
  ) => {
    if (!isSignedIn) {
      throw new Error('User not signed in')
    }

    return new Promise((resolve, reject) => {
      const sender = userData?.profile?.stxAddress?.testnet || 'unknown'
      const netUrl = (network as any)?.url || 'testnet-default'
      // Pretty-print function args for debugging
      const argPreview = (functionArgs || []).map((a: any) => {
        try {
          return JSON.parse(JSON.stringify(a))
        } catch {
          return String(a)
        }
      })

      console.groupCollapsed(
        `%cStacks Tx → ${contractAddress}.${contractName}::${functionName}`,
        'color:#16a34a;font-weight:600'
      )
      console.log('Sender:', sender)
      console.log('Network:', netUrl)
      console.log('PostConditions:', postConditions)
      console.log('Args:', argPreview)
      console.groupEnd()

      openContractCall({
        contractAddress,
        contractName,
        functionName,
        functionArgs,
        network,
        postConditionMode: PostConditionMode.Allow,
        postConditions,
        anchorMode: AnchorMode.Any,
        onFinish: (data) => {
          // data contains txId and txRaw
          const txId = (data as any).txId
          const explorer = `https://explorer.hiro.so/tx/${txId}?chain=testnet`
          console.info('%cTx Submitted', 'color:#0ea5e9', { txId, explorer })
          resolve({ txId, explorer })
        },
        onCancel: () => {
          console.warn('Tx canceled by user')
          reject(new Error('User canceled transaction'))
        }
      })
    })
  }

  // Simple in-memory cache to avoid hammering the API on identical reads
  const readCache = new Map<string, { ts: number; value: any }>()
  const CACHE_TTL_MS = 10_000 // 10 seconds

  const callReadOnlyFunction = async (functionName: string, functionArgs: any[]) => {
    const options = {
      contractAddress,
      contractName,
      functionName,
      functionArgs,
      network,
      senderAddress: userData?.profile?.stxAddress?.testnet || contractAddress,
    }

    try {
      // Cache key: fn + args JSON
      const key = `${functionName}:${JSON.stringify(functionArgs)}`
      const cached = readCache.get(key)
      const now = Date.now()
      if (cached && now - cached.ts < CACHE_TTL_MS) {
        console.debug('Read cache hit:', key)
        return cached.value
      }

      console.groupCollapsed(
        `%cStacks Read → ${contractAddress}.${contractName}::${functionName}`,
        'color:#22c55e;font-weight:600'
      )
      console.log('Sender:', options.senderAddress)
      console.log('Args:', functionArgs)
      console.groupEnd()
      // Retry with backoff on 429 and 5xx
      const maxAttempts = 4
      let attempt = 0
      let lastErr: any
      while (attempt < maxAttempts) {
        try {
          const res = await stacksCallReadOnlyFunction(options)
          readCache.set(key, { ts: Date.now(), value: res })
          console.debug('Read result:', res)
          return res
        } catch (e: any) {
          lastErr = e
          const msg = String(e?.message || e)
          const shouldRetry = /429|5\d\d|rate limit|server is down/i.test(msg)
          if (!shouldRetry) break
          const waitMs = Math.min(1000 * Math.pow(2, attempt), 6000) + Math.floor(Math.random() * 250)
          console.warn(`Read retry ${attempt + 1}/${maxAttempts} in ${waitMs}ms due to:`, msg)
          await new Promise(r => setTimeout(r, waitMs))
          attempt++
        }
      }
      // If we got here, retries exhausted
      throw lastErr
    } catch (e) {
      console.error('Read error', e)
      throw e
    }
  }

  const value: StacksContextType = {
    userSession,
    userData,
    isSignedIn,
    network,
    contractAddress,
    contractName,
    connectWallet,
    signOut,
    callContractFunction,
    callReadOnlyFunction,
  }

  return (
    <StacksContext.Provider value={value}>
      {children}
    </StacksContext.Provider>
  )
}
