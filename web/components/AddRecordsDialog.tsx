"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle } from "lucide-react";
import { useAccount } from "wagmi";
import { EthosIDContract, EthosABI } from "@/lib/const";
import { celoClient } from "@/utils/client";

interface AddRecordsDialogProps {
  ensName: string;
  onRecordsAdded?: (credential: any) => void;
}

export default function AddRecordsDialog({ ensName, onRecordsAdded }: AddRecordsDialogProps) {
  const [open, setOpen] = useState(false);
  const [credentialKey, setCredentialKey] = useState("com.credential");
  const [credentialValue, setCredentialValue] = useState("");
  const [credentialLoading, setCredentialLoading] = useState(false);
  const [issuedCredential, setIssuedCredential] = useState<string | null>(null);
  const [storingToEns, setStoringToEns] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [recordValue, setRecordValue] = useState("");
  
  const { address: connectedAddress } = useAccount();

  const extractCountryFromEnsName = (ensName: string): string => {
    // Extract country from ENS name like "leo5.india.eth" -> "IND"
    const parts = ensName.split('.');
    if (parts.length >= 2) {
      const countryPart = parts[parts.length - 2].toLowerCase(); // Get the second to last part
      
      // Map country names to codes
      switch (countryPart) {
        case 'india':
          return 'IND';
        case 'argentina':
          return 'ARG';
        case 'france':
          return 'FRA';
        default:
          return 'IND'; // Default fallback
      }
    }
    return 'IND'; // Default fallback
  };

  const storeCredentialToEns = async (credential: any) => {
    if (!connectedAddress) {
      alert("Please connect your wallet first");
      return;
    }

    setStoringToEns(true);
    try {
      const country = extractCountryFromEnsName(ensName);
      const label = ensName.split('.')[0]; // Get the label part (e.g., "leo5" from "leo5.india.eth")
      
      // Stringify the entire credential object
      const credentialValue = JSON.stringify(credential);
      
      console.log(`Storing credential with key: ${credentialKey}`);
      console.log(`Credential value:`, credentialValue);
      
      const hash = await celoClient?.writeContract({
        address: EthosIDContract as `0x${string}`,
        abi: EthosABI,
        functionName: 'setTextRecord',
        args: [
          country,
          label,
          credentialKey,
          credentialValue
        ],
        account: connectedAddress as `0x${string}`
      });

      console.log(`Transaction hash for credential:`, hash);
      alert(`Successfully stored credential to ENS! Transaction: ${hash?.slice(0, 10)}...`);
    } catch (error) {
      console.error("Error storing credential to ENS:", error);
      alert("Failed to store credential to ENS: " + (error as Error).message);
    } finally {
      setStoringToEns(false);
    }
  };


  const issueCredential = async () => {
    if (!connectedAddress) {
      alert("Please connect your wallet first");
      return;
    }

    if (!credentialKey.trim() || !recordValue.trim()) {
      alert("Please select a record type and enter a value");
      return;
    }

    setCredentialLoading(true);
    try {
      // Create credential subject with key-value pair
      const credentialSubject = {
        id: `did:ens:${ensName}#${connectedAddress}`,
        ensName: ensName,
        address: connectedAddress,
        [credentialKey]: recordValue, // Include the key-value pair
        credentialType: "identity",
        issuedAt: new Date().toISOString()
      };

      console.log("Sending credential subject:", credentialSubject);

      // Issue credential via API
      const response = await fetch('https://b8b185f222e8.ngrok-free.app/issue-credential', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credentialSubject,
          issuerAlias: 'ethos-issuer',
          proofFormat: 'jwt'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setIssuedCredential(result.credential.proof.jwt);
        // Automatically store the entire credential object to ENS
        await storeCredentialToEns(result.credential);
      } else {
        throw new Error(result.error || "Failed to issue credential");
      }
    } catch (error) {
      console.error("Error issuing credential:", error);
      alert("Failed to issue credential");
    } finally {
      setCredentialLoading(false);
    }
  };

   const textRecords = [
    "email",
    "url",
    "avatar",
    "description",
    "com.twitter",
    "com.github",
    "com.discord",
    "org.telegram",
    "com.reddit",
    "com.instagram",
    "com.linkedin",
    "com.twitch",
    "com.tiktok",
    "com.creditscore",
    "com.bank",
    "com.netflix"
  ]
  


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="w-full bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 hover:text-blue-200"
        >
          <Shield className="h-4 w-4 mr-2" />
          Issue Credentials
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg bg-slate-900/95 backdrop-blur-md border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="text-white">Issue Verifiable Credentials</DialogTitle>
          <DialogDescription className="text-slate-300">
            Create verifiable credentials and store them on ENS for <strong>{ensName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Available Text Records */}
          <div className="space-y-3">
            <Label className="text-slate-200">Select a record type:</Label>
            <div className="flex flex-wrap gap-2">
              {textRecords.map((record) => (
                <button
                  key={record}
                  onClick={() => {
                    setSelectedRecord(record);
                    setCredentialKey(record);
                    setRecordValue("");
                  }}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    selectedRecord === record
                      ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                      : "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600/50"
                  }`}
                >
                  {record}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Record Value Input */}
          {selectedRecord && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-slate-200">Value for {selectedRecord}</Label>
                <Input
                  placeholder={`Enter value for ${selectedRecord}...`}
                  value={recordValue}
                  onChange={(e) => setRecordValue(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                />
                <div className="text-xs text-slate-400">
                  This will be included in the credential as {selectedRecord}: "{recordValue}"
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Custom Key (optional)</Label>
                <Input
                  placeholder={selectedRecord}
                  value={credentialKey}
                  onChange={(e) => setCredentialKey(e.target.value)}
                  className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400"
                />
                <div className="text-xs text-slate-400">
                  Override the key name if needed (defaults to the selected record type)
                </div>
              </div>
            </div>
          )}

          {/* Issued Credential Display */}
          {issuedCredential && (
            <div className="p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">Credential Issued & Stored</span>
              </div>
              <div className="text-xs text-green-200 font-mono break-all">
                {issuedCredential.slice(0, 50)}...
              </div>
              <div className="text-xs text-green-300 mt-2">
                ✓ Credential issued and records stored to ENS automatically
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={issueCredential}
              disabled={credentialLoading}
              className="flex-1 bg-green-600/20 border border-green-500/30 text-green-300 hover:bg-green-600/30 hover:text-green-200"
            >
              {credentialLoading ? (
                <>
                  <Shield className="h-4 w-4 mr-2 animate-pulse" />
                  Issuing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Issue Credential
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
