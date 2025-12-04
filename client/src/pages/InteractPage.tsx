import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Code2 } from 'lucide-react';

export default function InteractPage() {
  const InteractSidePanel = (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Contract Interaction</CardTitle>
          <CardDescription>Call functions on deployed contracts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Contract Address</Label>
            <Input placeholder="0x..." />
          </div>
          <div className="space-y-2">
            <Label>ABI (Optional)</Label>
            <Input placeholder="Paste ABI JSON..." />
          </div>
          <Button className="w-full">
            <Code2 className="mr-2 h-4 w-4" />
            Load Contract
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <MainLayout>
      <ChatView 
        title="Interact with Contracts"
        subtitle="Read and write to smart contracts"
        placeholder="Example: Call balanceOf on 0x..."
        initialItems={[{
          type: 'message',
          data: {
            id: 'welcome-interact',
            role: 'assistant',
            content: 'I can help you interact with any smart contract. Provide the contract address and the function you want to call.',
            timestamp: new Date()
          }
        }]}
        sidePanel={InteractSidePanel}
      />
    </MainLayout>
  );
}
