import { useState } from 'react';
import { useWalletClient } from 'wagmi';
import { Zap, Shield, Crown, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { executeAction } from '@/lib/api';
import { createPaymentHeaderWithWallet, selectPaymentDetails } from '@/lib/q402';
import { MobileMenuTrigger } from '@/components/sidebar/AppSidebar';
import ConnectBtn from '@/components/ConnectBtn';

export default function PremiumPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [accessStatus, setAccessStatus] = useState<'locked' | 'unlocked'>('locked');
  const [paymentStep, setPaymentStep] = useState<'idle' | 'signing' | 'verifying' | 'success' | 'error'>('idle');
  
  const { data: walletClient } = useWalletClient();

  const handleUnlock = async () => {
    setIsLoading(true);
    setPaymentStep('idle');

    try {
      // 1. Attempt to access premium content
      console.log("Requesting premium access...");
      let result = await executeAction('premium-access');

      // 2. Handle 402 Payment Required
      if (result.paymentRequired) {
        console.log("Payment required:", result.paymentRequired);
        
        if (!walletClient) {
          toast.error("Please connect your wallet first");
          setIsLoading(false);
          return;
        }

        setPaymentStep('signing');
        toast.info("Please sign the payment request in your wallet...");

        // Select payment method (BNB Testnet)
        const paymentDetails = selectPaymentDetails(result.paymentRequired, {
          network: "bsc-testnet"
        });

        if (!paymentDetails) {
          throw new Error("No supported payment method found.");
        }

        // Generate Q402 header
        console.log("Generating payment header...");
        const header = await createPaymentHeaderWithWallet(walletClient, walletClient.account!, {
            ...paymentDetails,
            authorization: {
                ...paymentDetails.authorization,
                chainId: Number(paymentDetails.authorization.chainId),
                nonce: Number(paymentDetails.authorization.nonce)
            }
        });

        setPaymentStep('verifying');
        console.log("Retrying with header...");
        
        // 3. Retry with payment header
        result = await executeAction('premium-access', header);
      }

      // 4. Handle Success
      if (result.success) {
        console.log("Success:", result.data);
        setAccessStatus('unlocked');
        setPaymentStep('success');
        toast.success("Premium access unlocked!");
      } else {
        throw new Error("Failed to unlock premium access.");
      }

    } catch (error: any) {
      console.error("Unlock failed:", error);
      setPaymentStep('error');
      toast.error(error.message || "Failed to process payment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
       <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 md:py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 md:gap-3">
          <MobileMenuTrigger />
          <h1 className="text-lg md:text-xl font-semibold flex items-center gap-2">
            Premium Verification
            <Badge variant="secondary" className="gap-1 hidden sm:flex font-normal">
              <Zap className="h-3 w-3" />
              Q402 Demo
            </Badge>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ConnectBtn/>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Unlock Premium Features</h2>
            <p className="text-muted-foreground">
              Experience the power of the Q402 protocol. Sign to pay effortlessly.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature Cards */}
            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Secure Execution</CardTitle>
                <CardDescription>
                  Your transactions are verified and executed securely on-chain.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-yellow-500 mb-2" />
                <CardTitle>Gas Sponsored</CardTitle>
                <CardDescription>
                  Don't worry about gas fees. We handle the submission for you.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Crown className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle>Instant Access</CardTitle>
                <CardDescription>
                  One signature is all it takes to unlock premium capabilities.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Action Area */}
          <div className="flex justify-center pt-8">
            <Card className="w-full max-w-md border-2 border-primary/20 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle>
                  {accessStatus === 'locked' ? 'Premium Access Locked' : 'Premium Access Granted'}
                </CardTitle>
                <CardDescription>
                  {accessStatus === 'locked' 
                    ? 'Verify your wallet to unlock exclusive agent features.' 
                    : 'You now have full access to all premium features.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6 min-h-[160px]">
                {accessStatus === 'locked' ? (
                  <div className="bg-muted/30 rounded-full p-6 mb-4">
                    <Crown className="h-12 w-12 text-muted-foreground opacity-50" />
                  </div>
                ) : (
                  <div className="bg-green-500/10 rounded-full p-6 mb-4 animate-in zoom-in duration-300">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                  </div>
                )}
                
                {paymentStep === 'signing' && (
                  <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground animate-pulse">
                     <Loader2 className="h-4 w-4 animate-spin" />
                     Waiting for signature...
                  </div>
                )}
                {paymentStep === 'verifying' && (
                  <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground animate-pulse">
                     <Loader2 className="h-4 w-4 animate-spin" />
                     Verifying payment...
                  </div>
                )}
                 {paymentStep === 'error' && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                     <AlertTriangle className="h-4 w-4" />
                     Verification failed. Try again.
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center pb-6">
                {accessStatus === 'locked' ? (
                  <Button 
                    size="lg" 
                    onClick={handleUnlock} 
                    disabled={isLoading}
                    className="w-full sm:w-auto min-w-[200px]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Unlock Now
                        <Zap className="ml-2 h-4 w-4 fill-current" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full sm:w-auto min-w-[200px]" disabled>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    Active
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
