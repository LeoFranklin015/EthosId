import { createPublicClient, http, getContract, namehash } from 'viem'
import { mainnet } from 'viem/chains'
import { EthosIDContract, EthosABI } from './const'

// ENS Registry ABI (minimal)
const ENS_REGISTRY_ABI = [
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'resolver',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'ttl',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint64' }]
  }
] as const

// ENS Resolver ABI (minimal)
const ENS_RESOLVER_ABI = [
  {
    name: 'text',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' }
    ],
    outputs: [{ name: '', type: 'string' }]
  },
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }]
  },
  {
    name: 'contenthash',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'bytes' }]
  }
] as const

// ENS Registry address on mainnet
const ENS_REGISTRY_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" as const

export interface DomainData {
  // Basic ENS data
  name: string
  owner: string
  resolver: string
  ttl: number
  expiry: number | null
  
  // Your contract data
  isAvailable: boolean
  country: string
  registry: string
  verificationStatus: boolean
  
  // Profile data (from IPFS)
  avatar?: string
  description?: string
  website?: string
  twitter?: string
  github?: string
  
  // Additional metadata
  createdAt: number
  lastUpdated: number
  transactionCount: number
}

export interface ENSRegistryData {
  owner: string
  resolver: string
  ttl: number
}

export interface ContractData {
  isAvailable: boolean
  verificationStatus: boolean
  metadata: Record<string, any>
}

export interface ProfileData {
  avatar?: string
  description?: string
  website?: string
  twitter?: string
  github?: string
  email?: string
}

/**
 * Get viem client for blockchain calls
 */
function getClient() {
  return createPublicClient({
    chain: mainnet,
    transport: http('https://eth.llamarpc.com')
  })
}

/**
 * Get namehash for a domain using viem
 */
function getNamehash(domain: string): `0x${string}` {
  return namehash(domain)
}

/**
 * Fetch basic ENS registry data
 */
export async function fetchENSData(domainName: string): Promise<ENSRegistryData | null> {
  try {
    const client = getClient()
    const registry = getContract({
      address: ENS_REGISTRY_ADDRESS,
      abi: ENS_REGISTRY_ABI,
      client
    })
    
    const node = getNamehash(domainName)
    
    const [owner, resolver, ttl] = await Promise.all([
      registry.read.owner([node]),
      registry.read.resolver([node]),
      registry.read.ttl([node])
    ])
    
    return {
      owner,
      resolver,
      ttl: Number(ttl)
    }
  } catch (error) {
    console.error("Error fetching ENS data:", error)
    return null
  }
}

/**
 * Fetch data from your smart contract
 */
export async function fetchContractData(domainName: string, registry: string): Promise<ContractData | null> {
  try {
    const client = getClient()
    const contract = getContract({
      address: EthosIDContract as `0x${string}`,
      abi: EthosABI,
      client
    })
    
    // Extract label from domain (e.g., "leo5" from "leo5.india.eth")
    const label = domainName.split('.')[0]
    
    // Call available function
    const isAvailable = await contract.read.available([label, registry as `0x${string}`])
    
    // Try to get verification status (if the function exists)
    let verificationStatus = false
    try {
      const result = await contract.read.userCountryVerification([registry as `0x${string}`, label])
      verificationStatus = Boolean(result)
    } catch (e) {
      // Function might not exist or user not verified
      verificationStatus = false
    }
    
    return {
      isAvailable: Boolean(isAvailable),
      verificationStatus: Boolean(verificationStatus),
      metadata: {
        country: getCountryFromDomain(domainName),
        registeredAt: Date.now(),
        lastVerified: Date.now()
      }
    }
  } catch (error) {
    console.error("Error fetching contract data:", error)
    return null
  }
}

/**
 * Fetch profile data from ENS resolver
 */
export async function fetchProfileData(domainName: string): Promise<ProfileData | null> {
  try {
    const client = getClient()
    const registry = getContract({
      address: ENS_REGISTRY_ADDRESS,
      abi: ENS_REGISTRY_ABI,
      client
    })
    
    const node = getNamehash(domainName)
    
    // Get resolver address
    const resolverAddress = await registry.read.resolver([node])
    
    if (resolverAddress === "0x0000000000000000000000000000000000000000") {
      return null // No resolver set
    }
    
    const resolver = getContract({
      address: resolverAddress,
      abi: ENS_RESOLVER_ABI,
      client
    })
    
    // Fetch text records
    const [avatar, description, website, twitter, github, email] = await Promise.all([
      resolver.read.text([node, "avatar"]).catch(() => ""),
      resolver.read.text([node, "description"]).catch(() => ""),
      resolver.read.text([node, "url"]).catch(() => ""),
      resolver.read.text([node, "com.twitter"]).catch(() => ""),
      resolver.read.text([node, "com.github"]).catch(() => ""),
      resolver.read.text([node, "email"]).catch(() => "")
    ])
    
    return {
      avatar: avatar || undefined,
      description: description || undefined,
      website: website || undefined,
      twitter: twitter || undefined,
      github: github || undefined,
      email: email || undefined
    }
  } catch (error) {
    console.error("Error fetching profile data:", error)
    return null
  }
}

/**
 * Fetch transaction history using viem
 */
export async function fetchTransactionHistory(domainName: string): Promise<any[]> {
  try {
    const client = getClient()
    const node = getNamehash(domainName)
    
    // Get recent blocks to search for transactions
    const latestBlock = await client.getBlockNumber()
    const fromBlock = latestBlock - BigInt(10000) // Search last ~10k blocks
    
    // Get logs for ENS events
    const logs = await client.getLogs({
      address: ENS_REGISTRY_ADDRESS,
      fromBlock,
      toBlock: 'latest'
    })
    
    // Filter logs that might be related to this domain
    const relatedLogs = logs.filter(log => {
      // Check if the namehash appears in the log data
      return log.data.includes(node.slice(2))
    })
    
    // Get transaction details for related logs
    const transactions = await Promise.all(
      relatedLogs.slice(0, 10).map(async (log) => {
        try {
          const tx = await client.getTransaction({ hash: log.transactionHash })
          const receipt = await client.getTransactionReceipt({ hash: log.transactionHash })
          
          return {
            type: "ENS Event",
            timestamp: Number(tx.blockNumber) * 12000, // Approximate timestamp
            transactionHash: log.transactionHash,
            from: tx.from,
            to: tx.to,
            value: tx.value?.toString() || "0",
            blockNumber: Number(tx.blockNumber),
            gasUsed: receipt?.gasUsed?.toString() || "0"
          }
        } catch (e) {
          return null
        }
      })
    )
    
    return transactions.filter(Boolean)
  } catch (error) {
    console.error("Error fetching transaction history:", error)
    return []
  }
}

/**
 * Get country from domain name
 */
function getCountryFromDomain(domain: string): string {
  if (domain.includes('.india.eth')) return 'India'
  if (domain.includes('.france.eth')) return 'France'
  if (domain.includes('.argentina.eth')) return 'Argentina'
  return 'Unknown'
}

/**
 * Get registry address for country
 */
export function getRegistryAddress(country: string): string {
  switch (country) {
    case 'India': return "0xc3a4eB979e9035486b54Fe8b57D36aEF9519eAc6"
    case 'France': return "0xf9D7aBb40ff5943B0bb53D584e72daFC7A5c79DB"
    case 'Argentina': return "0x7B923b2948F41993c194eC8F761Fb2eE294A55Fa"
    default: return "0xc3a4eB979e9035486b54Fe8b57D36aEF9519eAc6"
  }
}

/**
 * Comprehensive domain data fetcher
 */
export async function fetchDomainData(domainName: string): Promise<DomainData | null> {
  try {
    const country = getCountryFromDomain(domainName)
    const registry = getRegistryAddress(country)
    
    // Fetch data from all sources in parallel
    const [ensData, contractData, profileData, transactionHistory] = await Promise.all([
      fetchENSData(domainName),
      fetchContractData(domainName, registry),
      fetchProfileData(domainName),
      fetchTransactionHistory(domainName)
    ])

    if (!ensData) {
      throw new Error("Failed to fetch ENS registry data")
    }

    // Calculate expiry from TTL
    const expiry = ensData.ttl > 0 ? Math.floor(Date.now() / 1000) + ensData.ttl : null

    return {
      name: domainName,
      owner: ensData.owner,
      resolver: ensData.resolver,
      ttl: ensData.ttl,
      expiry,
      isAvailable: contractData?.isAvailable ?? true,
      country,
      registry,
      verificationStatus: contractData?.verificationStatus ?? false,
      avatar: profileData?.avatar,
      description: profileData?.description,
      website: profileData?.website,
      twitter: profileData?.twitter,
      github: profileData?.github,
      createdAt: transactionHistory.length > 0 ? Math.min(...transactionHistory.map(tx => tx.timestamp)) : Date.now(),
      lastUpdated: Date.now(),
      transactionCount: transactionHistory.length
    }
  } catch (error) {
    console.error("Error fetching comprehensive domain data:", error)
    return null
  }
}
