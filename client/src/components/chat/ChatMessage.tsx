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
            {isUser ? 'You' : 'Web3 Agent'}
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
          <MessageContent content={message.content} />
        </div>
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown-like rendering
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = '';
  let codeLanguage = '';

  lines.forEach((line, index) => {
    // Code block handling
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.slice(3);
        codeContent = '';
      } else {
        elements.push(
          <pre
            key={`code-${index}`}
            className="my-3 overflow-x-auto rounded-lg bg-secondary/50 p-4 font-mono text-sm"
          >
            <code className="text-foreground">{codeContent}</code>
          </pre>
        );
        inCodeBlock = false;
        codeContent = '';
      }
      return;
    }

    if (inCodeBlock) {
      codeContent += (codeContent ? '\n' : '') + line;
      return;
    }

    // Headers
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="mt-4 mb-2 text-lg font-semibold">
          {line.slice(3)}
        </h2>
      );
      return;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="mt-3 mb-2 text-base font-semibold">
          {line.slice(4)}
        </h3>
      );
      return;
    }

    // Bold text and inline code
    if (line.startsWith('**') && line.includes(':**')) {
      const [label, ...rest] = line.split(':**');
      elements.push(
        <p key={index} className="my-1">
          <strong>{label.slice(2)}:</strong>
          {rest.join(':**')}
        </p>
      );
      return;
    }

    // Table handling
    if (line.startsWith('|')) {
      // Skip separator lines
      if (line.includes('---')) return;

      const cells = line
        .split('|')
        .filter(Boolean)
        .map((cell) => cell.trim());

      elements.push(
        <div
          key={index}
          className="grid gap-4 py-1 text-sm"
          style={{ gridTemplateColumns: `repeat(${cells.length}, 1fr)` }}
        >
          {cells.map((cell, i) => (
            <span
              key={i}
              className={i === 0 ? 'text-muted-foreground' : 'font-medium'}
            >
              {cell}
            </span>
          ))}
        </div>
      );
      return;
    }

    // List items
    if (line.startsWith('- ')) {
      elements.push(
        <div key={index} className="flex items-start gap-2 my-1">
          <span className="text-primary mt-1.5">•</span>
          <span>{formatInlineCode(line.slice(2))}</span>
        </div>
      );
      return;
    }

    // Regular paragraph
    if (line.trim()) {
      elements.push(
        <p key={index} className="my-2 leading-relaxed">
          {formatInlineCode(line)}
        </p>
      );
    }
  });

  return <>{elements}</>;
}

function formatInlineCode(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    // Bold text
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bp, j) => {
      if (bp.startsWith('**') && bp.endsWith('**')) {
        return <strong key={`${i}-${j}`}>{bp.slice(2, -2)}</strong>;
      }
      return bp;
    });
  });
}
