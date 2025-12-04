import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { executeTransaction } from '@/lib/api';

export default function SwapPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [fromToken, setFromToken] = useState('USDT');
  const [toToken, setToToken] = useState('BNB');

  const handleSwap = async () => {
    if (!amount) return;
    
    setIsLoading(true);
    try {
      await executeTransaction('swap', {
        from: `${amount} ${fromToken}`,
        to: toToken,
        amount: amount,
        token: fromToken
      });
      toast.success('Swap executed successfully!');
      setAmount('');
    } catch (error) {
      toast.error('Failed to execute swap');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const SwapForm = (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quick Swap</CardTitle>
          <CardDescription>Manual swap interface</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex gap-2">
              <Input 
                type="number" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button variant="outline" className="w-24">{fromToken}</Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" size="icon" onClick={() => {
              setFromToken(toToken);
              setToToken(fromToken);
            }}>
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex gap-2">
              <Input type="number" placeholder="0.00" disabled />
              <Button variant="outline" className="w-24">{toToken}</Button>
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleSwap} 
            disabled={isLoading || !amount}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Swapping...
              </>
            ) : (
              'Swap'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <MainLayout>
      <ChatView 
        title="Token Swap"
        subtitle="Trade tokens instantly with AI assistance"
        placeholder="Example: Swap 100 USDT for BNB..."
        initialItems={[{
          type: 'message',
          data: {
            id: 'welcome-swap',
            role: 'assistant',
            content: 'Hello! I can help you swap tokens on BNB Chain. You can ask me to perform a swap or use the quick form on the right.',
            timestamp: new Date()
          }
        }]}
        sidePanel={SwapForm}
      />
    </MainLayout>
  );
}
