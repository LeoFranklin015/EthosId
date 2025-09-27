"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, ExternalLink, Loader2, User, Globe, Mail, MessageSquare, Github, Twitter, Youtube, Instagram } from "lucide-react";
import { getEnsAddress, getEnsAvatar, getAllEnsRecords } from "@/utils/ens";

interface EnsProfileData {
  name: string;
  address: string | null;
  avatar: string | null;
  records: Array<{ key: string; value: string }>;
}

interface EnsProfileCardProps {
  ensName: string;
}

const getSocialIcon = (key: string) => {
  switch (key) {
    case "com.twitter":
      return <Twitter className="h-4 w-4" />;
    case "com.github":
      return <Github className="h-4 w-4" />;
    case "com.youtube":
      return <Youtube className="h-4 w-4" />;
    case "com.instagram":
      return <Instagram className="h-4 w-4" />;
    case "email":
      return <Mail className="h-4 w-4" />;
    case "url":
      return <Globe className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
};

const formatSocialKey = (key: string) => {
  if (key.startsWith("com.")) {
    return key.replace("com.", "").charAt(0).toUpperCase() + key.replace("com.", "").slice(1);
  }
  if (key.startsWith("org.")) {
    return key.replace("org.", "").charAt(0).toUpperCase() + key.replace("org.", "").slice(1);
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
};

const getInitials = (name: string) => {
  return name.split(".")[0].slice(0, 2).toUpperCase();
};

export default function EnsProfileCard({ ensName }: EnsProfileCardProps) {
  const [profileData, setProfileData] = useState<EnsProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [address, avatar, records] = await Promise.all([
          getEnsAddress(ensName),
          getEnsAvatar(ensName),
          getAllEnsRecords(ensName),
        ]);

        setProfileData({
          name: ensName,
          address,
          avatar,
          records,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch ENS data");
      } finally {
        setLoading(false);
      }
    };

    if (ensName) {
      fetchProfileData();
    }
  }, [ensName]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDescription = () => {
    const descRecord = profileData?.records.find(r => r.key === "description");
    return descRecord?.value || "No description available";
  };

  const getSocialRecords = () => {
    return profileData?.records.filter(r => 
      r.key.startsWith("com.") || r.key.startsWith("org.") || 
      r.key === "email" || r.key === "url"
    ) || [];
  };

  const getOtherRecords = () => {
    return profileData?.records.filter(r => 
      !r.key.startsWith("com.") && !r.key.startsWith("org.") && 
      r.key !== "email" && r.key !== "url" && r.key !== "description"
    ) || [];
  };

  if (loading) {
    return (
      <Card className="w-full max-w-sm mx-auto bg-slate-900/60 backdrop-blur-md border-slate-700/50 shadow-xl">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-sm mx-auto bg-slate-900/60 backdrop-blur-md border-slate-700/50 shadow-xl">
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <div className="text-red-400 mb-2 text-sm">Error loading profile</div>
          <div className="text-xs text-slate-400">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!profileData) {
    return (
      <Card className="w-full max-w-sm mx-auto bg-slate-900/60 backdrop-blur-md border-slate-700/50 shadow-xl">
        <CardContent className="flex items-center justify-center py-6">
          <div className="text-slate-400 text-sm">No profile data found</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto bg-slate-900/60 backdrop-blur-md border-slate-700/50 shadow-xl">
      <CardHeader className="text-center pb-3">
        <div className="flex flex-col items-center space-y-3">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profileData.avatar || ""} alt={ensName} />
            <AvatarFallback className="text-sm font-semibold">
              {getInitials(ensName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold text-white">{ensName}</CardTitle>
            <CardDescription className="text-center text-sm text-slate-300 line-clamp-2">
              {getDescription()}
            </CardDescription>
          </div>

          {profileData.address && (
            <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg w-full">
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">ETH</Badge>
              <span className="font-mono text-sm flex-1 text-left text-slate-200">
                {formatAddress(profileData.address)}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(profileData.address!, "address")}
                  className="h-6 w-6 p-0"
                >
                  {copiedField === "address" ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://sepolia.etherscan.io/address/${profileData.address}`, '_blank')}
                  className="h-6 w-6 p-0"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Social Links */}
        {getSocialRecords().length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2 text-white">
              <Globe className="h-4 w-4" />
              Social Links
            </h4>
            <div className="grid gap-2">
              {getSocialRecords().map((record) => (
                <div
                  key={record.key}
                  className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getSocialIcon(record.key)}
                    <span className="text-sm font-medium text-slate-200">
                      {formatSocialKey(record.key)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400 truncate max-w-32">
                      {record.value}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(record.value, `social-${record.key}`)}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === `social-${record.key}` ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Records Accordion */}
        {getOtherRecords().length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2 text-white">
              <User className="h-4 w-4" />
              Additional Records
            </h4>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="records" className="border-none">
                <AccordionTrigger className="py-2 px-0 text-sm hover:no-underline text-slate-300">
                  View all records ({getOtherRecords().length})
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                  {getOtherRecords().map((record) => (
                    <div
                      key={record.key}
                      className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                          {formatSocialKey(record.key)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400 truncate max-w-32">
                          {record.value}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(record.value, `record-${record.key}`)}
                          className="h-6 w-6 p-0"
                        >
                          {copiedField === `record-${record.key}` ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* No Records Message */}
        {profileData.records.length === 0 && (
          <div className="text-center py-3 text-slate-400 text-xs">
            No additional records found for this ENS name
          </div>
        )}

        <Separator className="bg-slate-700" />
        
        <div className="text-center pt-2">
          <Badge variant="secondary" className="text-xs bg-slate-800/50 border-slate-600 text-slate-300">
            Sepolia Testnet
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
