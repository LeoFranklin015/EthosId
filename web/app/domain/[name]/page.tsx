"use client";

import EnsProfileCard from "@/components/EnsProfileCard";
import { BackgroundEffects } from "@/components/shared/solution-hero-background";
import Navbar from "@/components/Navbar";

interface DomainPageProps {
  params: {
    name: string;
  };
}

export default function DomainPage({ params }: DomainPageProps) {
  const ensName = params.name;
  
  return (
     <div className="min-h-screen bg-slate-900 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <BackgroundEffects />
      </div>

      {/* Navbar */}
      <Navbar />
        
        {/* Main content with proper spacing for fixed navbar */}
        <div className="relative z-10 pt-24 pb-8 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-white">
                ENS Profile
              </h1>
              <p className="text-xl text-slate-300">
                View ENS profile and records for <strong className="text-white">{ensName}</strong>
              </p>
            </div>
            
            <EnsProfileCard ensName={ensName} />
            
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-lg text-sm text-slate-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                This profile is fetched from Sepolia testnet
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}