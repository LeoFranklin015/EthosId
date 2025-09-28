"use client";

import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Navbar from "../../components/Navbar";
import { Badge } from "@/components/ui/badge";
import { getDomainsForAccount } from "../../lib/graphql";

export default function DomainsPage() {
  const { address, isConnected } = useAccount();
  const [domains, setDomains] = useState<Array<{
    id: string;
    name: string;
    country: string;
    status: "Active" | "Pending" | "Expired";
    registeredAt: string;
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDomains = async () => {
      if (!isConnected || !address) {
        setDomains([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const domainsData = await getDomainsForAccount(address.toLowerCase());
        
        
        // Transform the data to match our component's expected format
        const transformedDomains = domainsData.map((domain, index: number) => ({
          id: `${domain.name}-${index}`,
          name: domain.name,
          country: "Unknown", // ENS doesn't provide country info directly
          status: (domain.expiryDate && new Date(domain.expiryDate * 1000) > new Date() ? "Active" : "Expired") as "Active" | "Pending" | "Expired",
          registeredAt: domain.createdAt ? new Date(domain.createdAt * 1000).toISOString().split('T')[0] : "Unknown"
        }));

        setDomains(transformedDomains);
      } catch (err) {
        console.error('Error fetching domains:', err);
        setError('Failed to fetch domains. Please try again.');
        setDomains([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDomains();
  }, [isConnected, address]);

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      </div>

      {/* Navbar */}
      <Navbar />

      <main className="relative z-50 max-w-6xl mx-auto px-6 md:px-8 pt-24 md:pt-28 pb-12 md:pb-16">
        <header className="mb-8 md:mb-12 text-center md:text-left">
          <Badge className="bg-slate-800/60 text-slate-200 border-slate-600/50">EthosID</Badge>
          <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-white text-balance">
            My Domains
          </h1>
          <p className="mt-2 text-slate-300 leading-relaxed">
            Manage your country-verified ENS domains
          </p>
        </header>

        <section className="space-y-6">
          {!isConnected ? (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-4">Please connect your wallet</div>
              <p className="text-slate-500">Connect your wallet to view your domains.</p>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-4">Loading domains...</div>
              <p className="text-slate-500">Fetching your ENS domains from the blockchain.</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-lg mb-4">Error loading domains</div>
              <p className="text-slate-500">{error}</p>
            </div>
          ) : domains.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400 text-lg mb-4">No domains found</div>
              <p className="text-slate-500">You haven't claimed any domains yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        {domain.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-slate-300">
                        <span>Country: {domain.country}</span>
                        <span>•</span>
                        <span>Registered: {domain.registeredAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          domain.status === "Active"
                            ? "default"
                            : domain.status === "Pending"
                            ? "secondary"
                            : "destructive"
                        }
                        className={
                          domain.status === "Active"
                            ? "bg-green-600/20 text-green-400 border-green-600/50"
                            : domain.status === "Pending"
                            ? "bg-yellow-600/20 text-yellow-400 border-yellow-600/50"
                            : "bg-red-600/20 text-red-400 border-red-600/50"
                        }
                      >
                        {domain.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

