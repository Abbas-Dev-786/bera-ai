import { FileCode, Plus, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MobileMenuTrigger } from '@/components/sidebar/AppSidebar';

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

export default function ContractsPage() {
  return (
    <MainLayout>
      <div className="flex h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2">
            <MobileMenuTrigger />
            <h1 className="text-lg md:text-xl font-semibold">Smart Contracts</h1>
          </div>
          <Button className="gap-2" size="sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Contract</span>
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl space-y-4 md:space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                className="pl-10"
              />
            </div>

            {/* Contract Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              {SAMPLE_CONTRACTS.map((contract) => (
                <Card key={contract.id} className="cursor-pointer transition-colors hover:border-primary/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                          <FileCode className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{contract.name}</CardTitle>
                          <CardDescription>{contract.type}</CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={contract.status === 'deployed' ? 'default' : 'secondary'}
                      >
                        {contract.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {contract.address || 'Not deployed'}
                      </span>
                      {contract.auditScore && (
                        <Badge variant="outline" className="gap-1">
                          Audit: {contract.auditScore}/100
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State CTA */}
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <FileCode className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-semibold">Create Your First Contract</h3>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  Use the chat to generate smart contracts with AI assistance
                </p>
                <Button variant="outline">Go to Chat</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
