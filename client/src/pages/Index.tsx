import { useState, useRef, useEffect } from 'react';
import { Bot, Zap } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { QuickActions } from '@/components/chat/QuickActions';
import { ActionCard, ActionData, ActionStatus } from '@/components/chat/ActionCard';
import { sendChatMessage, Message, ActionData as ApiActionData } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MobileMenuTrigger } from '@/components/sidebar/AppSidebar';

interface ChatItem {
  type: 'message' | 'action';
  data: Message | ActionData;
}

export default function Index() {
  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
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
      
      // If there's an action, add it as a separate item
      if (response.action) {
        setChatItems((prev) => [...prev, { type: 'action', data: response.action as ActionData }]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionApprove = (actionId: string) => {
    // Update action status to executing, then completed
    setChatItems((prev) =>
      prev.map((item) => {
        if (item.type === 'action' && (item.data as ActionData).id === actionId) {
          return { ...item, data: { ...item.data, status: 'executing' as ActionStatus } };
        }
        return item;
      })
    );

    // Simulate execution delay
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

  const hasMessages = chatItems.length > 0;

  return (
    <MainLayout>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <MobileMenuTrigger />
            <h1 className="text-lg md:text-xl font-semibold">Web3 Super Agent</h1>
            <Badge variant="secondary" className="gap-1 hidden sm:flex">
              <Zap className="h-3 w-3" />
              BNB Testnet
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-muted-foreground text-xs md:text-sm">
              ChainGPT
            </Badge>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {!hasMessages ? (
            // Welcome Screen
            <div className="flex h-full flex-col items-center justify-center px-4 py-8 overflow-y-auto">
              <div className="mb-6 md:mb-8 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25">
                <Bot className="h-7 w-7 md:h-8 md:w-8 text-primary-foreground" />
              </div>
              
              <h2 className="mb-2 text-2xl md:text-3xl font-bold text-center">Web3 Super Agent</h2>
              <p className="mb-6 md:mb-8 max-w-md text-center text-sm md:text-base text-muted-foreground px-4">
                Your AI copilot for BNB Chain. Research protocols, generate & audit
                smart contracts, and execute transactions—all through chat.
              </p>

              <QuickActions onSelect={handleSend} />

              <div className="mt-8 md:mt-12 w-full max-w-2xl px-2">
                <ChatInput onSend={handleSend} disabled={isLoading} />
              </div>
            </div>
          ) : (
            // Chat View
            <div className="flex h-full flex-col">
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="mx-auto max-w-3xl px-2 md:px-0">
                  {chatItems.map((item) => {
                    if (item.type === 'message') {
                      const message = item.data as Message;
                      return <ChatMessage key={message.id} message={message} />;
                    } else {
                      const action = item.data as ActionData;
                      return (
                        <div key={action.id} className="px-2 md:px-4 py-3 md:py-4">
                          <ActionCard
                            action={action}
                            onApprove={handleActionApprove}
                            onReject={handleActionReject}
                          />
                        </div>
                      );
                    }
                  })}
                  {isLoading && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="border-t border-border bg-background/80 backdrop-blur-sm px-3 md:px-4 py-3 md:py-4">
                <div className="mx-auto max-w-2xl">
                  <ChatInput
                    onSend={handleSend}
                    disabled={isLoading}
                    placeholder="Continue the conversation..."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
