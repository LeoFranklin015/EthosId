"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BackgroundEffects } from "@/components/shared/solution-hero-background"
import { cn } from "@/lib/utils"

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

const ALLOWED_RE = /^[A-Za-z0-9 .,_]*$/

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
  const h = hashString(q)
  const isRegistered = h % 3 === 0
  const boxAvailable = h % 5 !== 0
  return [
    { label: `${q}.india.eth`, status: isRegistered ? "Registered" : "Available" },
    { label: `${q}.box`, status: boxAvailable ? "Available" : "Registered" },
    { label: q, status: "Not Supported" },
  ]
}

export default function ClaimPage() {
  const [query, setQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Suggestion | null>(null)

  const suggestions = useMemo(() => computeSuggestions(query), [query])
  const disabled = !selected

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
            Allowed characters: letters, numbers, spaces, dot (.), underscore (_), and comma (,).
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
                <Input
                  id="name"
                  value={query}
                  onChange={(e) => {
                    const val = e.target.value
                    if (!ALLOWED_RE.test(val)) {
                      setError("Only letters, numbers, spaces, dot (.), underscore (_), and comma (,) are allowed.")
                    } else {
                      setError(null)
                    }
                    setQuery(val.replace(/[^A-Za-z0-9 .,_]/g, "")) // hard-enforce allowed set
                  }}
                  placeholder="Enter your name (e.g., leo)"
                  className="h-14 md:h-16 text-lg md:text-xl bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Results dropdown */}
              {query.trim().length > 0 && (
                <div className="mt-3 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-slate-700/50 overflow-hidden shadow-xl">
                  {suggestions.map((s, idx) => (
                    <button
                      key={s.label}
                      onClick={() => setSelected(s)}
                      className={cn(
                        "w-full text-left px-4 py-4 flex items-center justify-between hover:bg-slate-800/60 transition-colors",
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
                    </button>
                  ))}
                </div>
              )}

              {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
            </div>

            {/* Example reference image (optional) */}
            <div className="mt-6 hidden md:block">
              <figure className="opacity-80">
                <img
                  src="/images/username-search-mock.png"
                  alt="Example of a web3 username search UI with a dropdown of suggestions and status chips."
                  className="w-full rounded-xl border border-slate-700/50"
                />
                <figcaption className="sr-only">Reference design for the search and results UI</figcaption>
              </figure>
            </div>
          </div>

          {/* Right: Preview / action card */}
          <div className="w-full">
            <Card
              className={cn(
                "relative rounded-2xl bg-slate-900/60 p-6 md:p-8 min-h-[220px] border",
                glowRing,
                glowBeforeAfter,
                disabled && "opacity-50 pointer-events-none",
              )}
              aria-disabled={disabled}
            >
              <h2 className="text-xl md:text-2xl text-white font-semibold">Preview & Continue</h2>
              <p className="mt-2 text-slate-300">
                {selected ? (
                  <>
                    Selected: <span className="font-medium text-white">{selected.label}</span>
                  </>
                ) : (
                  "Select a name from the list to continue."
                )}
              </p>

              <div className="mt-6 flex items-center gap-3">
                <Button disabled={!selected} className="h-11 px-6">
                  Continue
                </Button>
                {selected && <Badge className={cn("px-3 py-1", statusColor(selected.status))}>{selected.status}</Badge>}
              </div>

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
