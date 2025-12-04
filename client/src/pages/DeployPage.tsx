import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

export default function DeployPage() {
  const DeploySidePanel = (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Deploy Contract</CardTitle>
          <CardDescription>Launch your smart contracts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg text-sm text-muted-foreground">
            <p>To deploy a contract:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Generate or paste contract code</li>
              <li>Compile the contract</li>
              <li>Confirm deployment transaction</li>
            </ol>
          </div>
          <Button className="w-full" variant="outline">
            <Rocket className="mr-2 h-4 w-4" />
            View Recent Deployments
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <MainLayout>
      <ChatView 
        title="Deploy Contracts"
        subtitle="Launch smart contracts to BNB Chain"
        placeholder="Example: Deploy the MyToken contract..."
        initialItems={[{
          type: 'message',
          data: {
            id: 'welcome-deploy',
            role: 'assistant',
            content: 'I can help you deploy smart contracts. If you have a contract code ready, just paste it here or ask me to generate one first.',
            timestamp: new Date()
          }
        }]}
        sidePanel={DeploySidePanel}
      />
    </MainLayout>
  );
}
