import { useState, useRef, useEffect } from 'react';
import { Bot, Zap } from 'lucide-react';
import { useWalletClient } from 'wagmi';
import { createPaymentHeaderWithWallet, selectPaymentDetails } from '@/lib/q402';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput, ChatSuggestion } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ActionCard, ActionData, ActionStatus } from '@/components/chat/ActionCard';
import { sendChatMessage, Message, ActionData as ApiActionData, executeAction } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MobileMenuTrigger } from '@/components/sidebar/AppSidebar';
import ConnectBtn from '../ConnectBtn';

export type ChatItem = 
  | { type: 'message'; data: Message }
  | { type: 'action'; data: ActionData };

interface ChatViewProps {
  title: string;
  subtitle?: string;
  initialItems?: ChatItem[];
  placeholder?: string;
  sidePanel?: React.ReactNode;
  suggestions?: ChatSuggestion[];
  onProcessMessage?: (message: string) => Promise<{ message: Message; action?: ActionData }>;
  showToneSelector?: boolean;
}

export function ChatView({ 
  title, 
  subtitle, 
  initialItems = [], 
  placeholder = "Type a message...",
  sidePanel,
  suggestions,
  onProcessMessage,
  showToneSelector = false
}: ChatViewProps) {
  const [chatItems, setChatItems] = useState<ChatItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState("beginner");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: walletClient } = useWalletClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatItems, isLoading]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setChatItems((prev) => [...prev, { type: 'message', data: userMessage }]);
    setIsLoading(true);

    try {
      let response: { message: Message; action?: ActionData };

      if (onProcessMessage) {
        // Use the provided custom handler
        response = await onProcessMessage(content);
      } else {
        // Default: send to chat agent
        const chatRes = await sendChatMessage(content, undefined, selectedTone);
        response = {
          message: chatRes.message,
          action: chatRes.action as ActionData | undefined
        };
      }

      setChatItems((prev) => [...prev, { type: 'message', data: response.message }]);
      
      if (response.action) {
        setChatItems((prev) => [...prev, { type: 'action', data: response.action as ActionData }]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to process message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionApprove = async (actionId: string) => {
    // 1. Update status to 'executing'
    setChatItems((prev) =>
      prev.map((item) => {
        if (item.type === 'action' && (item.data as ActionData).id === actionId) {
          return { ...item, data: { ...item.data, status: 'executing' as ActionStatus } };
        }
        return item;
      })
    );

    try {
      // 2. Call API to execute (might return 402)
      let result = await executeAction(actionId);

      // 3. Handle 402 Payment Required
      if (result.paymentRequired) {
        if (!walletClient) {
          throw new Error("Please connect your wallet to execute this action.");
        }

        // Update status to 'signing'
        setChatItems((prev) =>
          prev.map((item) => {
            if (item.type === 'action' && (item.data as ActionData).id === actionId) {
              return { ...item, data: { ...item.data, status: 'signing' as ActionStatus } };
            }
            return item;
          })
        );
        
        toast.info("Please sign the payment request in your wallet...");

        const paymentDetails = selectPaymentDetails(result.paymentRequired, {
           network: "bsc-testnet" // We assume this for now
        });

        if (!paymentDetails) {
           throw new Error("No supported payment method found in 402 response.");
        }
        
        // Use walletClient.account or just use the address if account is not populated fully.
        // Wagmi v2 walletClient.account is usually an object { address: ... } or just reference?
        // Actually executeAction with Payment Header
        let account = walletClient.account;
        // If account is missing, we might need to get address from useAccount() hook really.
        // But let's assume walletClient has it or user is connected.
        if(!account) {
            // Logic to get account if needed, but for now throwing error.
             throw new Error("Wallet info missing.");
        }

        // Generate Q402 header
        const header = await createPaymentHeaderWithWallet(walletClient, account, {
            ...paymentDetails,
            authorization: {
                ...paymentDetails.authorization,
                chainId: Number(paymentDetails.authorization.chainId), 
                nonce: Number(paymentDetails.authorization.nonce)
            }
        });

        // Update status back to 'executing'
        setChatItems((prev) =>
          prev.map((item) => {
            if (item.type === 'action' && (item.data as ActionData).id === actionId) {
              return { ...item, data: { ...item.data, status: 'executing' as ActionStatus } };
            }
            return item;
          })
        );

        // Retry with header
        result = await executeAction(actionId, header);
      }

      // 4. Handle Final Success/Failure
      if (result.success) {
        setChatItems((prev) =>
          prev.map((item) => {
            if (item.type === 'action' && (item.data as ActionData).id === actionId) {
              return { 
                ...item, 
                data: { 
                  ...item.data, 
                  status: 'completed' as ActionStatus,
                  details: {
                      ...item.data.details,
                      txHash: result.data.payment?.txHash || result.data.message || "Confirmed"
                  }
                } 
              };
            }
            return item;
          })
        );
        toast.success('Transaction executed successfully!');
      } else {
        throw new Error("Execution outcome unknown.");
      }

    } catch (error: any) {
      console.error("Execution failed:", error);
      setChatItems((prev) =>
        prev.map((item) => {
          if (item.type === 'action' && (item.data as ActionData).id === actionId) {
            return { ...item, data: { ...item.data, status: 'failed' as ActionStatus } };
          }
           return item;
        })
      );
      toast.error(error.message || 'Transaction failed');
    }
  };

  const handleActionReject = (actionId: string) => {
    setChatItems((prev) =>
      prev.map((item) => {
        if (item.type === 'action' && (item.data as ActionData).id === actionId) {
          return { ...item, data: { ...item.data, status: 'rejected' as ActionStatus } };
        }
        return item;
      })
    );
    toast.info('Transaction rejected');
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 md:py-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 md:gap-3">
          <MobileMenuTrigger />
          <div>
            <h1 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              {title}
              <Badge variant="secondary" className="gap-1 hidden sm:flex font-normal">
                <Zap className="h-3 w-3" />
                BNB Testnet
              </Badge>
            </h1>
            {subtitle && <p className="text-xs text-muted-foreground hidden md:block">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConnectBtn/>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
            <div className="mx-auto max-w-3xl space-y-4">
              {chatItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-50">
                  <Bot className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">Start a conversation</p>
                  <p className="text-sm">Type a message to begin</p>
                </div>
              ) : (
                chatItems.map((item, index) => {
                  if (item.type === 'message') {
                    return <ChatMessage key={(item.data as Message).id || index} message={item.data as Message} />;
                  } else {
                    return (
                      <div key={(item.data as ActionData).id || index} className="px-2 py-2">
                        <ActionCard
                          action={item.data as ActionData}
                          onApprove={handleActionApprove}
                          onReject={handleActionReject}
                        />
                      </div>
                    );
                  }
                })
              )}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-border bg-background/80 backdrop-blur-sm px-4 py-4">
            <div className="mx-auto max-w-3xl">
              <ChatInput
                onSend={handleSend}
                disabled={isLoading}
                placeholder={placeholder}
                suggestions={suggestions}
                selectedTone={selectedTone}
                onToneChange={setSelectedTone}
                showToneSelector={showToneSelector}
              />
            </div>
          </div>
        </div>

        {/* Side Panel (Optional) */}
        {sidePanel && (
          <div className="hidden lg:block w-80 xl:w-96 border-l border-border bg-muted/10 overflow-y-auto">
            {sidePanel}
          </div>
        )}
      </div>
    </div>
  );
}
