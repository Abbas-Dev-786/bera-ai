import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rocket, FileCode, Search, RefreshCw, Copy } from 'lucide-react';
import { getContracts, GeneratedContract, deployContractTx, Message, ActionData } from '@/lib/api';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

export default function DeployPage() {
  const [contracts, setContracts] = useState<GeneratedContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setIsLoading(true);
    try {
      const data = await getContracts({ limit: 50, search: searchQuery || undefined });
      setContracts(data.contracts);
    } catch (error) {
      console.error('Failed to load contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleProcessMessage = async (content: string): Promise<{ message: Message; action?: ActionData }> => {
    // Check if message is a deploy command
    const deployMatch = content.match(/deploy\s+(.+)/i);
    
    if (deployMatch) {
      const searchTerm = deployMatch[1].trim();
      
      // Find contract by ID or approximation
      const contract = contracts.find(c => 
        c.artifactId === searchTerm || 
        c.artifactId.startsWith(searchTerm) 
      );

      if (!contract) {
        return {
          message: {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `I couldn't find a contract with ID "${searchTerm}". Please check the ID from the list on the right.`,
            timestamp: new Date(),
            type: 'text'
          }
        };
      }

      if (!contract.bytecode) {
        // Auto-compile capability
        try {
          toast.info("Contract missing bytecode. Auto-compiling...");
          
          const { compileContract } = await import('@/lib/api');
          const compiled = await compileContract(contract.artifactId);
          
          if (!compiled.bytecode) {
             throw new Error("Compilation failed to produce bytecode");
          }
          
          // Update local contract object temporarily
          contract.bytecode = compiled.bytecode;
          contract.abi = compiled.abi;
          
          loadContracts();
          
        } catch (error: any) {
           return {
            message: {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `Auto-compilation failed: ${error.message}. Please try again later.`,
              timestamp: new Date(),
              type: 'error'
            }
          };
        }
      }

      let actionData: ActionData;

      try {
        const transaction = await deployContractTx(contract, []);
        // Map Transaction to ActionData
        actionData = {
            id: transaction.id,
            type: 'deploy',
            status: 'pending',
            title: 'Deploy Contract',
            description: `Deploying contract ${contract.artifactId.slice(0, 8)}...`,
            details: {
              'Bytecode Size': `${contract.bytecode.length / 2} bytes`,
              'Network': 'BNB Testnet'
            },
            riskLevel: 'low',
            timestamp: new Date()
        };
      } catch (error) {
        console.warn("Server deployment failed, using local fallback", error);
        const { createLocalDeployAction } = await import('@/lib/api');
        actionData = createLocalDeployAction(contract, []);
      }

      return {
        message: {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `I've prepared the deployment transaction for contract ${contract.artifactId.slice(0, 8)}... \n\nPlease review and sign the transaction below.`,
          timestamp: new Date(),
          type: 'text'
        },
        action: actionData
      };
    }

    // Default response if not a recognized command
    return {
      message: {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "To deploy a contract, please type 'Deploy [Contract ID]'. You can copy the ID from the list on the right.",
        timestamp: new Date(),
        type: 'text'
      }
    };
  };

  const DeploySidePanel = (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Available Contracts</h2>
        <Button size="icon" variant="ghost" onClick={loadContracts} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter contracts..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 -mx-2 px-2">
        {contracts.length === 0 && !isLoading ? (
          <div className="text-center p-8 text-sm text-muted-foreground bg-muted/20 rounded-lg border-2 border-dashed border-muted">
            No contracts found. 
            <br />
            Go to <a href="/generate" className="text-primary hover:underline">Generate</a> to create one.
          </div>
        ) : (
          contracts.map((contract) => (
            <Card key={contract.artifactId} className="group hover:border-primary/50 transition-colors">
              <CardHeader className="p-3 pb-2 space-y-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileCode className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-sm font-medium truncate" title={contract.artifactId}>
                        {contract.artifactId.slice(0, 10)}...
                      </CardTitle>
                      <CardDescription className="text-[10px] truncate">
                        {new Date(contract.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={contract.bytecode ? "default" : "secondary"} className="text-[10px] px-1.5 h-5">
                    {contract.bytecode ? "Compiled" : "Source Only"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 h-7 text-xs"
                    onClick={() => copyToClipboard(contract.artifactId)}
                  >
                    <Copy className="mr-1.5 h-3 w-3" />
                    Copy ID
                  </Button>
                  {contract.bytecode && (
                    <Button 
                      size="sm" 
                      className="flex-1 h-7 text-xs"
                      onClick={() => handleProcessMessage(`Deploy ${contract.artifactId}`).then(res => {
                         // This is a hack because we are outside the ChatView context. 
                         // Ideally, we'd lift state or use a global store.
                         // For now, we rely on the user manually typing or we could instruct them.
                         copyToClipboard(`Deploy ${contract.artifactId}`);
                         toast.info("Copied deploy command to clipboard. Paste it in the chat!");
                      })}
                    >
                      <Rocket className="mr-1.5 h-3 w-3" />
                      Deploy
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <MainLayout>
      <ChatView 
        title="Deploy Contracts"
        subtitle="Launch smart contracts to BNB Chain"
        placeholder="Type 'Deploy [Contract ID]'..."
        initialItems={[{
          type: 'message',
          data: {
            id: 'welcome-deploy',
            role: 'assistant',
            content: 'I can help you deploy smart contracts. Select a contract from the list on the right and type "Deploy [Contract ID]" to start.',
            timestamp: new Date()
          }
        }]}
        sidePanel={DeploySidePanel}
        onProcessMessage={handleProcessMessage}
      />
    </MainLayout>
  );
}
