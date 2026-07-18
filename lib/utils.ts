import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitial(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || ''
  return source ? source[0].toUpperCase() : '?'
}
