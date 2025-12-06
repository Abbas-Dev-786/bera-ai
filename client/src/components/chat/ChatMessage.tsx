
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // or any other style
import { Message } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Bot, User, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-4 px-4 py-6',
        isUser ? 'bg-transparent' : 'bg-card/50'
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-gradient-to-br from-primary/80 to-purple-600 text-primary-foreground'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className="flex-1 space-y-3 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isUser ? 'You' : 'BeraAI'}
          </span>
          {message.type === 'audit' && message.metadata?.auditScore && (
            <Badge
              variant={message.metadata.auditScore >= 80 ? 'default' : 'secondary'}
              className="gap-1"
            >
              <Shield className="h-3 w-3" />
              Score: {message.metadata.auditScore}/100
            </Badge>
          )}
          {message.metadata?.riskLevel && (
            <Badge
              variant={
                message.metadata.riskLevel === 'low'
                  ? 'default'
                  : message.metadata.riskLevel === 'medium'
                  ? 'secondary'
                  : 'destructive'
              }
              className="gap-1"
            >
              {message.metadata.riskLevel === 'low' ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              {message.metadata.riskLevel.charAt(0).toUpperCase() +
                message.metadata.riskLevel.slice(1)}{' '}
              Risk
            </Badge>
          )}
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              pre: ({ node, ...props }) => (
                <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                  <pre {...props} />
                </div>
              ),
              code: ({ node, ...props }) => {
                // @ts-expect-error - inline is passed by react-markdown but types are sometimes strict
                const { inline, className, children, ...rest } = props;
                if (inline) {
                  return (
                    <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...rest}>
                      {children}
                    </code>
                  );
                }
                return (
                  <code className={cn('text-sm font-mono', className)} {...rest}>
                    {children}
                  </code>
                );
              },
              table: ({ node, ...props }) => (
                <div className="my-4 w-full overflow-y-auto">
                  <table className="w-full" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
              ),
              td: ({ node, ...props }) => (
                <th className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
