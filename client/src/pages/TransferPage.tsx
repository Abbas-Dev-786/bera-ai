import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { executeTransaction } from '@/lib/api';

export default function TransferPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [token, setToken] = useState('USDT');

  const handleTransfer = async () => {
    if (!amount || !recipient) return;
    
    setIsLoading(true);
    try {
      await executeTransaction('transfer', {
        from: 'My Wallet',
        to: recipient,
        amount: `${amount} ${token}`,
        token: token
      });
      toast.success('Transfer initiated successfully!');
      setAmount('');
      setRecipient('');
    } catch (error) {
      toast.error('Failed to execute transfer');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const TransferForm = (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quick Transfer</CardTitle>
          <CardDescription>Send tokens manually</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Recipient Address</Label>
            <Input 
              placeholder="0x..." 
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button variant="outline" className="w-24">{token}</Button>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleTransfer} 
            disabled={isLoading || !amount || !recipient}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Tokens
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <MainLayout>
      <ChatView 
        title="Transfer Tokens"
        subtitle="Send assets to any address via chat"
        placeholder="Example: Send 50 USDT to 0x..."
        initialItems={[{
          type: 'message',
          data: {
            id: 'welcome-transfer',
            role: 'assistant',
            content: 'I can help you transfer tokens. Just tell me the amount and the recipient address.',
            timestamp: new Date()
          }
        }]}
        sidePanel={TransferForm}
      />
    </MainLayout>
  );
}
