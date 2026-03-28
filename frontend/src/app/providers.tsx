"use client";

/**
 * Providers Component
 * Root provider setup for wagmi, ConnectKit, and React Query.
 * Wraps entire app in required providers.
 */

import { ReactNode, useState } from "react";
import { createConfig, WagmiProvider, http } from "wagmi";
import { arbitrumSepolia, hardhat } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig(
  getDefaultConfig({
    chains: [arbitrumSepolia, hardhat],
    transports: {
      [arbitrumSepolia.id]: http(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL),
      [hardhat.id]: http("http://127.0.0.1:8545"),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "",
    appName: "Black Pools",
  })
);

export function Providers({ children }: { children: ReactNode }) {
  // Initialize QueryClient per-render to ensure SSR isolation
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
