import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Sparkles, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface ChatSuggestion {
  label: string;
  text: string;
}

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  suggestions?: ChatSuggestion[];
  selectedTone?: string;
  onToneChange?: (tone: string) => void;
  showToneSelector?: boolean;
}

export function ChatInput({ 
  onSend, 
  disabled, 
  placeholder, 
  suggestions, 
  selectedTone = "beginner", 
  onToneChange,
  showToneSelector = false
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="relative">

  {/* Tone Selection Bar */}
      {showToneSelector && (
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto scrollbar-none pb-1">
          <span className="flex items-center gap-1 shrink-0">
            <Settings2 className="h-3 w-3" />
            Tone:
          </span>
          {['Beginner', 'Technical', 'Concise', 'Expert'].map((tone) => {
            const value = tone.toLowerCase();
            const isSelected = selectedTone === value;
            return (
              <button
                key={value}
                onClick={() => onToneChange?.(value)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 transition-all border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card hover:bg-accent border-border text-muted-foreground"
                )}
              >
                {tone}
              </button>
            );
          })}
        </div>
      )}

      <div className="glass rounded-2xl p-1.5 shadow-lg">
        <div className="flex items-end gap-2 p-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask anything about Web3, smart contracts, or execute actions..."}
            disabled={disabled}
            className={cn(
              "min-h-[44px] max-h-[200px] flex-1 resize-none border-0 bg-transparent px-2",
              "placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0",
              "text-base leading-relaxed"
            )}
            rows={1}
          />

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || disabled}
              size="icon"
              className={cn(
                "h-9 w-9 shrink-0 rounded-xl transition-all",
                input.trim() && !disabled
                  ? "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {disabled ? (
                <Sparkles className="h-5 w-5 animate-pulse" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>


      {/* Suggestions bar */}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto scrollbar-none pb-1">
          <span className="flex items-center gap-1 shrink-0">
            <Sparkles className="h-3 w-3" />
            Try:
          </span>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInput(suggestion.text)}
              className="shrink-0 rounded-full bg-secondary/50 px-3 py-1 transition-colors hover:bg-secondary"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
