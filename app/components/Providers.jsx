// components/Providers.jsx
'use client'
import { SessionProvider } from 'next-auth/react'
import { CartProvider } from './cart'

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  )
}