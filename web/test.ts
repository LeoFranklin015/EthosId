// import { namehash } from "viem";

// function main() {
//     const node = namehash("india.eth"); 
//     console.log(node);
// }

// main(); 


import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
import { normalize } from 'viem/ens'

async function resolveEns(name: string) {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  })

  const normalized = normalize(name)

  // 1. Get the resolver contract address (optional, for diagnostics)
  const resolverAddress = await publicClient.getEnsResolver({
    name: normalized,
  })
  console.log("Resolver address:", resolverAddress)

  // 2. Get the Ethereum address that the ENS name points to
  const ensAddress = await publicClient.getEnsAddress({
    name: normalized,
  })
  console.log("ENS resolves to:", ensAddress)

  // 3. (Optional) If you want text records, e.g. “com.twitter”
  const twitterHandle = await publicClient.getEnsText({
    name: normalized,
    key: "com.twitter",
  })
  console.log("ENS text com.twitter:", twitterHandle)

  return ensAddress
}

resolveEns("leo1.argentina.eth").catch(console.error)
