import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatSTX(amount: number): string {
  return `${(amount / 1000000).toFixed(6)} STX`
}

export function truncateAddress(address: string, chars = 8): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function generateRecordId(): number {
  return Math.floor(Math.random() * 1000000) + Date.now()
}

export function roleToDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    admin: 'Administrator',
    doctor: 'Doctor',
    researcher: 'Researcher',
    emergency_responder: 'Emergency Responder',
    verifier: 'Verifier',
  }
  return roleMap[role] || role
}

export function statusToDisplayName(status: number): string {
  const statusMap: Record<number, string> = {
    0: 'Pending',
    1: 'Approved',
    2: 'Denied',
  }
  return statusMap[status] || 'Unknown'
}

export function getStatusColor(status: number): string {
  const colorMap: Record<number, string> = {
    0: 'text-yellow-600 bg-yellow-100',
    1: 'text-green-600 bg-green-100',
    2: 'text-red-600 bg-red-100',
  }
  return colorMap[status] || 'text-gray-600 bg-gray-100'
}
