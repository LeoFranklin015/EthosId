"use client"

import { useMemo, useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BackgroundEffects } from "@/components/shared/solution-hero-background"
import { cn } from "@/lib/utils"
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
  countries, 
  getUniversalLink,
} from "@selfxyz/qrcode"

const glowRing = "border border-[#1663F3]"
const glowBeforeAfter =
  "before:absolute before:content-[''] before:w-[80%] before:h-[20px] before:left-[10%] before:bottom-[0px] before:bg-[#1663F3] before:blur-[10px] before:opacity-20 " +
  "after:absolute after:content-[''] after:w-[90%] after:h-[30px] after:left-[5%] after:bottom-[-6px] after:bg-[#1663F3] after:blur-[15px] after:opacity-10"
const glowInteractive = "hover:before:opacity-30 hover:after:opacity-20 hover:shadow-[0_2px_12px_rgba(22,99,243,0.3)]"

type Status = "Available" | "Registered" | "Not Supported"

type Suggestion = {
  label: string
  status: Status
}

const ALLOWED_RE = /^[A-Za-z0-9]*$/

function statusColor(status: Status) {
  switch (status) {
    case "Available":
      return "bg-emerald-600/20 text-emerald-300"
    case "Registered":
      return "bg-blue-600/20 text-blue-300"
    default:
      return "bg-red-600/20 text-red-300"
  }
}

function hashString(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i)
  return Math.abs(h)
}

function computeSuggestions(base: string): Suggestion[] {
  const q = base.trim()
  if (!q) return []
  
  // Only show 3 demo domains with user input prefix
  return [
    { label: `${q}.india.eth`, status: "Available" as Status },
    { label: `${q}.france.eth`, status: "Registered" as Status },
    { label: `${q}.argentina.eth`, status: "Available" as Status },
  ]
}

export default function ClaimPage() {
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Suggestion | null>(null)
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null)
  const [universalLink, setUniversalLink] = useState("")
  const [userId] = useState("0xE08224B2CfaF4f27E2DC7cB3f6B99AcC68Cf06c0")

  const suggestions = useMemo(() => computeSuggestions(query), [query])
  const disabled = !selected

  // Use useMemo to cache the array to avoid creating a new array on each render
  const excludedCountries = useMemo(() => [countries.UNITED_STATES], [])

  // Initialize Self app when selected name changes
  useEffect(() => {
    if (!selected) {
      setSelfApp(null)
      setUniversalLink("")
      return
    }

    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "EthosID",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "ethosid-scope",
        endpoint: `0x8b995B9EA93EADC98BeEb5873F36DB263fdfE9cF`.toLowerCase(),
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png",
        userId: userId,
        endpointType: "staging_celo",
        userIdType: "hex",
        userDefinedData: selected.label, // Use the selected name as userDefinedData
        disclosures: {
          minimumAge: 18,
          excludedCountries: excludedCountries,
          nationality: true,
        }
      }).build()

      setSelfApp(app)
      setUniversalLink(getUniversalLink(app))
    } catch (error) {
      console.error("Failed to initialize Self app:", error)
    }
  }, [selected, excludedCountries, userId])

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <BackgroundEffects />
      </div>

      <main className="relative z-50 max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
        <header className="mb-8 md:mb-12 text-center md:text-left">
          <Badge className="bg-slate-800/60 text-slate-200 border-slate-600/50">EthosID</Badge>
          <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-white text-balance">
            Search and claim your country-verified ENS
          </h1>
          <p className="mt-2 text-slate-300 leading-relaxed">
            Allowed characters: letters and numbers only.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left: Search and results */}
          <div className="w-full">
            <div className="relative">
              <div
                className={cn(
                  "rounded-2xl bg-slate-900/60 px-4 py-2 ring-offset-0 transition-all",
                  glowRing,
                  glowBeforeAfter,
                  glowInteractive,
                  "relative",
                )}
              >
                <label htmlFor="name" className="sr-only">
                  ENS name
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    id="name"
                    value={query}
                    onChange={(e) => {
                      const val = e.target.value
                      if (!ALLOWED_RE.test(val)) {
                        setError("Only letters and numbers are allowed.")
                      } else {
                        setError(null)
                      }
                      setQuery(val.replace(/[^A-Za-z0-9]/g, "")) // hard-enforce allowed set
                    }}
                    placeholder="Enter your name (e.g., leo)"
                    className="flex-1 h-14 md:h-16 text-lg md:text-xl bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-slate-500"
                  />
                  <Button
                    onClick={() => {
                      if (query.trim()) {
                        // Auto-select first suggestion when go is clicked
                        const suggestions = computeSuggestions(query)
                        if (suggestions.length > 0) {
                          setSelected(suggestions[0])
                        }
                      }
                    }}
                    className="h-14 md:h-16 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    →
                  </Button>
                </div>
              </div>

              {/* Results dropdown - display only */}
              {query.trim().length > 0 && (
                <div className="mt-3 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-700/50 overflow-hidden shadow-xl">
                  {suggestions.map((s, idx) => (
                    <div
                      key={s.label}
                      className={cn(
                        "w-full text-left px-4 py-4 flex items-center justify-between",
                        idx !== suggestions.length - 1 && "border-b border-slate-700/40",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "size-6 rounded-full",
                            idx === 0
                              ? "bg-gradient-to-br from-fuchsia-500 to-cyan-400"
                              : idx === 1
                                ? "bg-green-500"
                                : "bg-slate-600",
                          )}
                          aria-hidden="true"
                        />
                        <span className="text-slate-200 text-lg">{s.label}</span>
                      </div>
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", statusColor(s.status))}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
            </div>
          </div>

          {/* Right: QR Code */}
          <div className="w-full">
            <Card
              className={cn(
                "relative rounded-2xl bg-slate-900/60 p-6 md:p-8 min-h-[400px] border flex flex-col items-center justify-center",
                glowRing,
                glowBeforeAfter,
                disabled && "opacity-50 pointer-events-none",
              )}
              aria-disabled={disabled}
            >
              <h2 className="text-xl md:text-2xl text-white font-semibold mb-4 text-center">
                {selected ? "Scan QR Code to Verify" : "Select a name to generate QR code"}
              </h2>
              
              {selected ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-slate-300 text-center mb-2">
                    Selected: <span className="font-medium text-white">{selected.label}</span>
                  </p>
                  
                  {selfApp ? (
                    <div className="bg-white p-4 rounded-xl">
                      <SelfQRcodeWrapper
                        selfApp={selfApp}
                        onSuccess={() => {
                          console.log("Verification successful!")
                        }}
                        onError={() => {
                          console.log("Verification failed")
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-[256px] h-[256px] bg-slate-800 animate-pulse flex items-center justify-center rounded-xl">
                      <p className="text-slate-400 text-sm">Loading QR Code...</p>
                    </div>
                  )}
                  
                  <Badge className={cn("px-3 py-1", statusColor(selected.status))}>
                    {selected.status}
                  </Badge>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-slate-400 mb-4">
                    Enter your name and click the arrow to generate a QR code for verification.
                  </p>
                  <div className="w-[256px] h-[256px] bg-slate-800/50 flex items-center justify-center rounded-xl mx-auto">
                    <p className="text-slate-500 text-sm">QR Code will appear here</p>
                  </div>
                </div>
              )}

              {/* Decorative glow interactions */}
              <div
                className={cn("absolute inset-0 rounded-2xl pointer-events-none", glowInteractive)}
                aria-hidden="true"
              />
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
