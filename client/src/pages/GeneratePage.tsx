import { FileCode, Plus, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const SAMPLE_CONTRACTS = [
  {
    id: '1',
    name: 'MyToken',
    type: 'ERC-20',
    address: '0x742d...2e5',
    status: 'deployed',
    auditScore: 92,
  },
  {
    id: '2',
    name: 'StakingPool',
    type: 'Staking',
    address: '0x9a3f...8b2c',
    status: 'deployed',
    auditScore: 87,
  },
  {
    id: '3',
    name: 'NFTCollection',
    type: 'ERC-721',
    address: null,
    status: 'draft',
    auditScore: null,
  },
];

export default function GeneratePage() {
  const GenerateSidePanel = (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Generated Contracts</h2>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {SAMPLE_CONTRACTS.map((contract) => (
          <Card key={contract.id} className="cursor-pointer transition-colors hover:border-primary/50">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                    <FileCode className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{contract.name}</CardTitle>
                    <CardDescription className="text-xs">{contract.type}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant={contract.status === 'deployed' ? 'default' : 'secondary'}
                  className="text-[10px] px-1.5 py-0"
                >
                  {contract.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                <span>
                  {contract.address || 'Not deployed'}
                </span>
                {contract.auditScore && (
                  <span className="flex items-center gap-1">
                    Audit: {contract.auditScore}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

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
      />
    </MainLayout>
  );
}
