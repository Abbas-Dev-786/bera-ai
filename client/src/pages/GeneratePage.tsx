import { useState, useEffect } from 'react';
import { FileCode, Plus, Search, Loader2, Rocket } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getContracts, GeneratedContract, generateContract, Message, deployContractTx, ActionData } from '@/lib/api';
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

  const handleProcessMessage = async (message: string): Promise<{ message: Message; action?: ActionData }> => {
    // Check if message is a deploy command
    const deployMatch = message.match(/deploy\s+(.+)/i);
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
        // Auto-compile flow
        await new Promise(resolve => setTimeout(resolve, 100)); // UI delay
        
        // Show compiling message
        const compilingMsgId = crypto.randomUUID();
        // Since we are inside a promise chain/process, we can't easily push a temporary message without context access
        // Ideally we'd emit an event or used a callback, but 'onProcessMessage' returns a single response.
        // We'll just do the work and respond with the result.
        
        toast.info(`Auto-compiling contract ${contract.artifactId.slice(0, 8)}...`);

        try {
           const { compileContract } = await import('@/lib/api');
           const compiled = await compileContract(contract.artifactId);
           
           if (!compiled.bytecode) {
              return {
                message: {
                  id: crypto.randomUUID(),
                  role: 'assistant',
                  content: `Failed to compile contract "${contract.artifactId}". The AI could not generate valid bytecode. Please try regenerating the contract.`,
                  timestamp: new Date(),
                  type: 'error'
                }
              };
           }
           
           // Update local state is tricky here without re-fetching, 
           // but 'deployContractTx' takes 'contract' object.
           // We use the compiled version.
           contract.bytecode = compiled.bytecode;
           contract.abi = compiled.abi;
           
           // Continue to deployment
        } catch (err: any) {
           return {
              message: {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `Compilation failed: ${err.message}`,
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

    // Default: Generation logic
    try {
      const contract = await generateContract(message);
      
      // Format the contract content with proper markdown
      const formattedContent = formatContractResponse(contract.contract);
      
      // Add contract metadata at the end
      const fullContent = `${formattedContent}\n\n---\n\n## Contract Details\n\n- **Artifact ID:** \`${contract.artifactId}\`\n- **Created:** ${new Date(contract.createdAt).toLocaleString()}\n\nType "Deploy ${contract.artifactId}" to deploy this contract.`;
      
      const contractMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: fullContent,
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
      throw error;
    }
  };

  const GenerateSidePanel = (
    <div className="p-4 space-y-4 h-full flex flex-col">
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

      <div className="flex-1 overflow-y-auto space-y-3 -mx-2 px-2">
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
            <Card key={contract.artifactId} className="group hover:border-primary/50 transition-colors">
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
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 mb-2">
                  <span>
                    {new Date(contract.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full text-xs h-7"
                  variant={contract.bytecode ? "secondary" : "outline"}
                  onClick={() => handleProcessMessage(`Deploy ${contract.artifactId}`).then(() => {
                      toast.info("Deployment started! Check the chat.");
                  })}
                >
                  <Rocket className="mr-1.5 h-3 w-3" />
                  {contract.bytecode ? "Deploy" : "Compile & Deploy"}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  // Parse and format the contract response into proper markdown
  const formatContractResponse = (contractContent: string): string => {
    // Handle both escaped newlines (\n) and actual newlines
    let formatted = contractContent;
    
    // If we see literal \n strings, replace them
    if (formatted.includes('\\n')) {
      formatted = formatted.replace(/\\n/g, '\n');
    }
    
    // Split by "---" separators to identify sections
    // Handle both "\n\n---\n\n" and "---" patterns
    const parts = formatted.split(/\n\n---\n\n|\n---\n/);
    
    const processedParts: string[] = [];
    
    for (let i = 0; i < parts.length; i++) {
      let part = parts[i].trim();
      
      // Check if this part contains the solidity code block
      // Pattern: "solidity\n" or "solidity " followed by code
      const solidityMatch = part.match(/^solidity\s*\n([\s\S]*)$/);
      if (solidityMatch) {
        const code = solidityMatch[1].trim();
        processedParts.push(`\`\`\`solidity\n${code}\n\`\`\``);
        continue;
      }
      
      // Format section headers
      // Convert "Overview:" to "## Overview"
      if (part.startsWith('Overview:')) {
        part = part.replace(/^Overview:\s*/, '## Overview\n\n');
      }
      
      // Convert other section headers (at start of line)
      part = part.replace(/^Security Considerations:/gm, '## Security Considerations');
      part = part.replace(/^Deployment:/gm, '## Deployment');
      part = part.replace(/^Compatibility:/gm, '## Compatibility');
      
      // Format bullet points consistently
      part = part.replace(/^-\s+/gm, '- ');
      
      // Format sub-bullets (indented with spaces)
      part = part.replace(/^  -\s+/gm, '  - ');
      
      processedParts.push(part);
    }
    
    // Join with horizontal rules for visual separation
    formatted = processedParts.join('\n\n---\n\n');
    
    // Clean up excessive newlines (more than 2 consecutive)
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    return formatted.trim();
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
        onProcessMessage={handleProcessMessage}
      />
    </MainLayout>
  );
}
