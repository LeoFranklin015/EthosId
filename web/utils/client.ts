import { createPublicClient, createWalletClient, custom, http } from "viem";
import { celoSepolia, sepolia } from "viem/chains";

// Create public client that works on server and client
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

// Safely create wallet client only in browser environment
export const walletClient =
  typeof window !== "undefined"
    ? createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      })
    : null;


export const celoClient = 
typeof window !== "undefined"
? createWalletClient({
    chain: celoSepolia,
    transport: custom(window.ethereum),
  })
: null;