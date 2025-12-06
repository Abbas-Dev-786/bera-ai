import { useState, useEffect } from 'react';
import { FileCode, Plus, Search, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getContracts, GeneratedContract, generateContract, Message } from '@/lib/api';
import { toast } from 'sonner';

export default function GeneratePage() {
  const [contracts, setContracts] = useState<GeneratedContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const data = await getContracts({ limit: 20, search: searchQuery || undefined });
      setContracts(data.contracts);
    } catch (error) {
      console.error('Failed to load contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadContracts();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const GenerateSidePanel = (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Generated Contracts</h2>
        <Button size="sm" variant="outline" onClick={loadContracts}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center p-8 text-sm text-muted-foreground">
            No contracts found. Generate one using the chat!
          </div>
        ) : (
          contracts.map((contract) => (
            <Card key={contract.artifactId} className="cursor-pointer transition-colors hover:border-primary/50">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium">{contract.artifactId.slice(0, 8)}...</CardTitle>
                      <CardDescription className="text-xs">Generated Contract</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Generated
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                  <span>
                    {new Date(contract.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const handleGenerateMessage = async (message: string) => {
    try {
      const contract = await generateContract(message);
      const contractMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I've generated a smart contract for you:\n\n\`\`\`solidity\n${contract.contract}\n\`\`\`\n\n**Contract Details:**\n- Artifact ID: ${contract.artifactId}\n- Created: ${new Date(contract.createdAt).toLocaleString()}`,
        timestamp: new Date(),
        type: 'code',
        metadata: {
          contractAddress: contract.artifactId,
        },
      };
      // Reload contracts list
      await loadContracts();
      return { message: contractMessage };
    } catch (error) {
      console.error('Contract generation failed:', error);
      throw error; // Let ChatView handle the error toast
    }
  };

  return (
    <MainLayout>
      <ChatView 
        title="Generate Smart Contracts"
        subtitle="Create custom smart contracts with AI"
        placeholder="Example: Generate an ERC20 token named SuperToken..."
        initialItems={[{
          type: 'message',
          data: {
            id: 'welcome-generate',
            role: 'assistant',
            content: 'I can help you create smart contracts. Describe what you need, and I will generate the Solidity code for you.',
            timestamp: new Date()
          }
        }]}
        sidePanel={GenerateSidePanel}
        suggestions={[
          { label: "ERC-20 Token", text: "Generate an ERC-20 token named MyToken" },
          { label: "Crowdfunding", text: "Create a crowdfunding contract" },
          { label: "Staking", text: "Write a staking contract for ERC-20" }
        ]}
        onProcessMessage={handleGenerateMessage}
      />
    </MainLayout>
  );
}
