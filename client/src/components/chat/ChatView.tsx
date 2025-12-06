import { useState, useRef, useEffect } from 'react';
import { Bot, Zap } from 'lucide-react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput, ChatSuggestion } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ActionCard, ActionData, ActionStatus } from '@/components/chat/ActionCard';
import { sendChatMessage, Message, generateContract, runContractAudit } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MobileMenuTrigger } from '@/components/sidebar/AppSidebar';
import ConnectBtn from '../ConnectBtn';

export interface ChatItem {
  type: 'message' | 'action';
  data: Message | ActionData;
}

interface ChatViewProps {
  title: string;
  subtitle?: string;
  initialItems?: ChatItem[];
  placeholder?: string;
  sidePanel?: React.ReactNode;
  suggestions?: ChatSuggestion[];
  showToneSelector?: boolean;
}

export function ChatView({ 
  title, 
  subtitle, 
  initialItems = [], 
  placeholder = "Type a message...",
  sidePanel,
  suggestions,
  showToneSelector = false
}: ChatViewProps) {
  const [chatItems, setChatItems] = useState<ChatItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState("beginner");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatItems, isLoading]);

  // Detect if message is requesting contract generation
  const isContractGenerationRequest = (text: string): boolean => {
    const lower = text.toLowerCase();
    return (
      lower.includes('generate') && 
      (lower.includes('contract') || lower.includes('solidity') || lower.includes('smart contract'))
    ) || (
      lower.includes('create') && 
      (lower.includes('contract') || lower.includes('solidity'))
    );
  };

  // Detect if message is requesting contract audit
  const isAuditRequest = (text: string): boolean => {
    const lower = text.toLowerCase();
    return (
      lower.includes('audit') || 
      lower.includes('security check') ||
      lower.includes('check for vulnerabilities')
    );
  };

  // Extract contract source from message (looks for code blocks or contract addresses)
  const extractContractSource = (text: string): string | null => {
    // Check for code blocks
    const codeBlockMatch = text.match(/```(?:solidity)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    
    // Check for contract address (0x...)
    const addressMatch = text.match(/0x[a-fA-F0-9]{40}/);
    if (addressMatch) {
      // For now, return null as we'd need to fetch from blockchain
      // This could be enhanced later
      return null;
    }
    
    // If message contains substantial code-like content, use it
    if (text.includes('pragma') || text.includes('contract ') || text.includes('function ')) {
      return text;
    }
    
    return null;
  };

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
      // Check for contract generation request
      if (isContractGenerationRequest(content)) {
        try {
          const contract = await generateContract(content);
          const contractMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `I've generated a smart contract for you:\n\n\`\`\`solidity\n${contract.contract}\n\`\`\`\n\n**Contract Details:**\n- Artifact ID: ${contract.artifactId}\n- Created: ${new Date(contract.createdAt).toLocaleString()}`,
            timestamp: new Date(),
            type: 'code',
            metadata: {
              contractAddress: contract.artifactId,
            },
          };
          setChatItems((prev) => [...prev, { type: 'message', data: contractMessage }]);
          toast.success('Contract generated successfully!');
          return;
        } catch (error) {
          console.error('Contract generation failed:', error);
          toast.error('Failed to generate contract. Please try again.');
        }
      }

      // Check for audit request
      if (isAuditRequest(content)) {
        const contractSource = extractContractSource(content);
        if (contractSource) {
          try {
            const audit = await runContractAudit({ source: contractSource });
            const auditMessage: Message = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `## Audit Report\n\n**Score:** ${audit.score !== null ? `${audit.score}/100` : 'N/A'}\n\n**Summary:**\n${audit.summary}\n\n**Full Report:**\n\`\`\`json\n${JSON.stringify(audit.report, null, 2)}\n\`\`\``,
              timestamp: new Date(),
              type: 'audit',
              metadata: {
                auditScore: audit.score,
                riskLevel: audit.score !== null ? (audit.score >= 80 ? 'low' : audit.score >= 60 ? 'medium' : 'high') : 'medium',
              },
            };
            setChatItems((prev) => [...prev, { type: 'message', data: auditMessage }]);
            toast.success('Audit completed!');
            return;
          } catch (error) {
            console.error('Audit failed:', error);
            toast.error('Failed to run audit. Please provide contract source code.');
          }
        } else {
          // Still send to chat agent for guidance
          toast.info('Please provide contract source code in a code block for auditing.');
        }
      }

      // Default: send to chat agent
      const response = await sendChatMessage(content, undefined, selectedTone);
      setChatItems((prev) => [...prev, { type: 'message', data: response.message }]);
      
      if (response.action) {
        setChatItems((prev) => [...prev, { type: 'action', data: response.action as ActionData }]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionApprove = (actionId: string) => {
    setChatItems((prev) =>
      prev.map((item) => {
        if (item.type === 'action' && (item.data as ActionData).id === actionId) {
          return { ...item, data: { ...item.data, status: 'executing' as ActionStatus } };
        }
        return item;
      })
    );

    setTimeout(() => {
      setChatItems((prev) =>
        prev.map((item) => {
          if (item.type === 'action' && (item.data as ActionData).id === actionId) {
            return { ...item, data: { ...item.data, status: 'completed' as ActionStatus } };
          }
          return item;
        })
      );
      toast.success('Transaction executed successfully!');
    }, 2000);
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
