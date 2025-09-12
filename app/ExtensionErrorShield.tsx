"use client"

import { useEffect } from 'react'

// Suppress unhandled runtime errors triggered by browser extensions (e.g., MetaMask)
export default function ExtensionErrorShield() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      const msg = String(event?.message || '').toLowerCase()
      const isExtension = (event?.filename || '').startsWith('chrome-extension://')
      if (isExtension || msg.includes('metamask') || msg.includes('ethereum')) {
        event.preventDefault()
        return false
      }
      return undefined
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = String((event?.reason && (event.reason.message || event.reason)) || '').toLowerCase()
      if (reason.includes('metamask') || reason.includes('ethereum')) {
        event.preventDefault()
        return false
      }
      return undefined
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onUnhandledRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onUnhandledRejection)
    }
  }, [])

  return null
}


