"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CustomConnectButton } from './ConnectButton'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function Navbar() {
  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] w-full max-w-5xl px-4">
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl px-6 py-3 shadow-xl pointer-events-auto">
        <div className="flex items-center justify-between">
          {/* Left: Wallet Connect Button */}
          <div className="flex items-center">
            <CustomConnectButton />
          </div>

          {/* Center: Navigation Options */}
          <div className="flex items-center gap-6">
            <Link 
              href="/claim" 
              className="text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded-md px-2 py-1 transition-colors text-sm font-medium cursor-pointer"
            >
              Claim Domain
            </Link>
            <Link 
              href="/domains" 
              className="text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded-md px-2 py-1 transition-colors text-sm font-medium cursor-pointer"
            >
              My Domains
            </Link>
          </div>

          {/* Right: Logo/Brand */}
          <div className="flex items-center">
            <span className="text-white font-bold text-lg">EthosID</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
