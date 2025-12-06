import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { bscTestnet } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import '@rainbow-me/rainbowkit/styles.css';

const config = getDefaultConfig({
  appName: 'BeraAI',
  projectId: 'YOUR_PROJECT_ID', // TODO: Get a project ID from WalletConnect
  chains: [ bscTestnet],
  ssr: false, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
