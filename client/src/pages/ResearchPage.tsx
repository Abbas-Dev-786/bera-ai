import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, TrendingUp, BookOpen } from 'lucide-react';

export default function ResearchPage() {
  const ResearchSidePanel = (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending Topics
          </CardTitle>
          <CardDescription>Popular research queries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="p-2 hover:bg-secondary/50 rounded cursor-pointer transition-colors">
            <span className="font-medium">Layer 2 Scaling</span>
            <p className="text-xs text-muted-foreground">Optimism vs Arbitrum</p>
          </div>
          <div className="p-2 hover:bg-secondary/50 rounded cursor-pointer transition-colors">
            <span className="font-medium">DeFi Yields</span>
            <p className="text-xs text-muted-foreground">Best stablecoin farms</p>
          </div>
          <div className="p-2 hover:bg-secondary/50 rounded cursor-pointer transition-colors">
            <span className="font-medium">NFT Market</span>
            <p className="text-xs text-muted-foreground">Floor price analysis</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• BNB Chain Documentation</p>
          <p>• DeFi Llama Analytics</p>
          <p>• CoinGecko API</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <MainLayout>
      <ChatView 
        title="Research & Analysis"
        subtitle="Deep dive into tokens, protocols, and market trends"
        placeholder="Example: Explain how Uniswap V3 liquidity works..."
        initialItems={[{
          type: 'message',
          data: {
            id: 'welcome-research',
            role: 'assistant',
            content: 'I can help you research any Web3 topic. Ask me about protocols, tokenomics, or market trends.',
            timestamp: new Date()
          }
        }]}
        sidePanel={ResearchSidePanel}
        suggestions={[
          { label: "Explain protocols", text: "Explain how Uniswap V3 works" },
          { label: "Market Trends", text: "What are the current DeFi trends?" },
          { label: "Token Analysis", text: "Analyze the tokenomics of DOT" }
        ]}
        showToneSelector={true}
      />
    </MainLayout>
  );
}
