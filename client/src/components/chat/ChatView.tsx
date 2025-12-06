import { useState, useRef, useEffect } from 'react';
import { Bot, Zap } from 'lucide-react';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ActionCard, ActionData, ActionStatus } from '@/components/chat/ActionCard';
import { sendChatMessage, Message } from '@/lib/api';
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
}

export function ChatView({ 
  title, 
  subtitle, 
  initialItems = [], 
  placeholder = "Type a message...",
  sidePanel 
}: ChatViewProps) {
  const [chatItems, setChatItems] = useState<ChatItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      const response = await sendChatMessage(content);
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
