import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Coins, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createTransactionBundle } from '@/lib/api';
import { useAccount } from 'wagmi';

export default function StakePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('BNB');
  const { address } = useAccount();

  const handleStake = async () => {
    if (!amount) return;
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    try {
      const bundle = await createTransactionBundle('stake', {
        from: address,
        amount: amount,
        token: token,
        protocol: 'Venus Protocol'
      });
      
      toast.success(`Staking bundle created! Bundle ID: ${bundle.bundleId.slice(0, 8)}...`);
      toast.info('Please sign the bundle to complete the staking. Wallet signing integration pending.');
      setAmount('');
    } catch (error) {
      toast.error('Failed to create staking bundle');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const StakeForm = (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quick Stake</CardTitle>
          <CardDescription>Earn rewards with Venus Protocol</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Protocol</span>
              <span className="font-medium">Venus Protocol</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">APY</span>
              <span className="font-medium text-green-500">4.2%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amount to Stake</Label>
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
            onClick={handleStake} 
            disabled={isLoading || !amount}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Staking...
              </>
            ) : (
              <>
                <Coins className="mr-2 h-4 w-4" />
                Stake Now
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
        title="Stake Tokens"
        subtitle="Earn yield on your crypto assets"
        placeholder="Example: Stake 10 BNB..."
        initialItems={[{
          type: 'message',
          data: {
            id: 'welcome-stake',
            role: 'assistant',
            content: 'I can help you stake your tokens to earn rewards. Currently, Venus Protocol offers 4.2% APY on BNB.',
            timestamp: new Date()
          }
        }]}
        sidePanel={StakeForm}
      />
    </MainLayout>
  );
}
