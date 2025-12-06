import { Bot } from 'lucide-react';

export function TypingIndicator() {
  return (
    <div className="flex gap-4 px-4 py-6 bg-card/50">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-gradient-to-br from-primary/80 to-purple-600 text-primary-foreground">
        <Bot className="h-4 w-4" />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          BeraAI is thinking
        </span>
        <div className="typing-indicator flex gap-1">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="h-2 w-2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
