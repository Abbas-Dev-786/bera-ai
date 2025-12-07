import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code2, Play, AlertTriangle } from 'lucide-react';
import { parseAbi, encodeFunctionData } from 'viem';
import { toast } from 'sonner';
import { executeAction } from '@/lib/api';

export default function InteractPage() {
  const [address, setAddress] = useState('');
  const [abiText, setAbiText] = useState('');
  const [parsedFunctions, setParsedFunctions] = useState<any[]>([]);
  const [selectedFunc, setSelectedFunc] = useState<string>('');
  const [args, setArgs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleLoadContract = () => {
    try {
      if (!address || !abiText) {
        toast.error("Address and ABI are required");
        return;
      }
      // Simple heuristic parsing or using viem if it's a valid ABI string
      const abi = JSON.parse(abiText);
      const functions = abi.filter((item: any) => item.type === 'function' && item.stateMutability !== 'view');
      setParsedFunctions(functions);
      toast.success(`Loaded ${functions.length} write functions`);
    } catch (e: any) {
      toast.error("Invalid ABI JSON: " + e.message);
    }
  };

  const handleExecute = async () => {
    if (!selectedFunc || !address) return;
    
    setIsLoading(true);
    setResult(null);

    try {
        const funcAbi = parsedFunctions.find(f => f.name === selectedFunc);
        if (!funcAbi) throw new Error("Function not found");

        const orderedArgs = funcAbi.inputs.map((input: any) => args[input.name]);
        // Encode via Viem
        const data = encodeFunctionData({
            abi: [funcAbi],
            functionName: selectedFunc,
            args: orderedArgs
        });

        // Call API
        const response = await executeAction('interact', {
            type: 'interact',
            to: address,
            data,
            amount: '0' // Default 0 BNB for interactions for now
        });

        if (response.success) {
            setResult({ success: true, ...response.data });
            toast.success("Interaction Prepared! Please sign.");
        } else {
             // Handle Policy Warning if present (it comes as error usually or success:false)
             // Check if it was a policy rejection
             if (response.error) {
                 toast.error("Execution blocked: " + response.error.message);
                 setResult({ success: false, error: response.error });
             }
        }

    } catch (e: any) {
        toast.error("Error: " + e.message);
        setResult({ success: false, error: e });
    } finally {
        setIsLoading(false);
    }
  };


  const InteractSidePanel = (
    <div className="p-4 space-y-6 overflow-y-auto max-h-full">
      <Card>
        <CardHeader>
          <CardTitle>Contract Config</CardTitle>
          <CardDescription>Target Check</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Contract Address</Label>
            <Input 
                placeholder="0x..." 
                value={address} 
                onChange={e => setAddress(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label>ABI (JSON)</Label>
            <Textarea 
                placeholder="Paste ABI array [...]" 
                className="h-24 font-mono text-xs"
                value={abiText}
                onChange={e => setAbiText(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleLoadContract} variant="secondary">
            <Code2 className="mr-2 h-4 w-4" />
            Load Functions
          </Button>
        </CardContent>
      </Card>

      {parsedFunctions.length > 0 && (
          <Card>
            <CardHeader>
                <CardTitle>Execute</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Function</Label>
                    <Select onValueChange={setSelectedFunc}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select function" />
                        </SelectTrigger>
                        <SelectContent>
                            {parsedFunctions.map(f => (
                                <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                
                {selectedFunc && (
                    <div className="space-y-3 pt-2 border-t">
                        {parsedFunctions.find(f => f.name === selectedFunc)?.inputs.map((input: any, idx: number) => (
                            <div key={idx} className="space-y-1">
                                <Label className="text-xs">{input.name} ({input.type})</Label>
                                <Input 
                                    className="h-8"
                                    onChange={e => setArgs(prev => ({...prev, [input.name]: e.target.value}))}
                                />
                            </div>
                        ))}
                         <Button className="w-full mt-4" onClick={handleExecute} disabled={isLoading}>
                            {isLoading ? "Preparing..." : "Execute On-Chain"}
                            {!isLoading && <Play className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                )}
            </CardContent>
          </Card>
      )}

      {result && (
          <Card className={result.success ? "border-green-500/50" : "border-red-500/50"}>
              <CardHeader>
                  <CardTitle className="text-sm">Result</CardTitle>
              </CardHeader>
              <CardContent>
                  {result.success ? (
                      <div className="text-xs space-y-2">
                          <p className="text-green-500 font-medium">Bundle Created!</p>
                          <p className="break-all text-muted-foreground">ID: {result.bundleId}</p>
                          {result.warnings && result.warnings.length > 0 && (
                              <div className="bg-yellow-500/10 p-2 rounded text-yellow-600 mt-2">
                                  <div className="flex items-center gap-1 font-bold"><AlertTriangle className="h-3 w-3"/> Warning</div>
                                  <ul className="list-disc pl-4 mt-1">
                                    {result.warnings.map((w: string, i: number) => (
                                        <li key={i}>{w}</li>
                                    ))}
                                  </ul>
                              </div>
                          )}
                          <Button size="sm" variant="outline" className="w-full mt-2" onClick={() => toast.info("Check Chat for signature prompt (Mock)")}>
                              Sign & Pay
                          </Button>
                      </div>
                  ) : (
                      <p className="text-red-500 text-xs">{result.error?.message || "Unknown error"}</p>
                  )}
              </CardContent>
          </Card>
      )}
    </div>
  );

  return (
    <MainLayout>
      <ChatView 
        title="Interact with Contracts"
        subtitle="Read and write to smart contracts"
        placeholder="Or ask me to 'Audit this contract'..."
        initialItems={[{
          type: 'message',
          data: {
            id: 'welcome-interact',
            role: 'assistant',
            content: '# Smart Contract Interaction\n\nUse the panel on the right to load a contract ABI and execute functions securely on-chain. I will sanity check interactions against your safety policy.',
            timestamp: new Date()
          }
        }]}
        sidePanel={InteractSidePanel}
      />
    </MainLayout>
  );
}
