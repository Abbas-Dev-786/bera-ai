import {
  Search,
  Code2,
  Shield,
  ArrowRightLeft,
  Send,
  Coins,
  FileCode,
  Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  prompt: string;
  badge?: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: Search,
    label: 'Research',
    description: 'Explain tokens & protocols',
    prompt: 'Explain how PancakeSwap works on BNB Chain',
  },
  {
    icon: FileCode,
    label: 'Generate',
    description: 'Create smart contracts',
    prompt: 'Generate an ERC-20 token contract with burn function',
    badge: 'Popular',
  },
  {
    icon: Shield,
    label: 'Audit',
    description: 'Security analysis',
    prompt: 'Audit this smart contract for vulnerabilities',
  },
  // {
  //   icon: ArrowRightLeft,
  //   label: 'Swap',
  //   description: 'Trade tokens',
  //   prompt: 'Swap 100 USDT to BNB with 1% slippage',
  // },
  // {
  //   icon: Send,
  //   label: 'Transfer',
  //   description: 'Send tokens',
  //   prompt: 'Transfer 50 USDT to 0x742d35Cc6634C0532925a3b844Bc9e7595f4E2e5',
  // },
  // {
  //   icon: Coins,
  //   label: 'Stake',
  //   description: 'Earn rewards',
  //   prompt: 'Stake my BNB in the highest yield pool',
  // },
  // {
  //   icon: Rocket,
  //   label: 'Deploy',
  //   description: 'Launch contracts',
  //   prompt: 'Deploy the generated contract to BNB testnet',
  //   badge: 'New',
  // },
  {
    icon: Code2,
    label: 'Interact',
    description: 'Call contracts',
    prompt: 'Call the balanceOf function on this contract',
  },
];

interface QuickActionsProps {
  onSelect: (prompt: string) => void;
}

import { useNavigate } from 'react-router-dom';

export function QuickActions({ onSelect }: QuickActionsProps) {
  const navigate = useNavigate();

  const handleAction = (action: QuickAction) => {
    if (action.label === 'Swap') {
      navigate('/swap');
    } else if (action.label === 'Transfer') {
      navigate('/transfer');
    } else if (action.label === 'Stake') {
      navigate('/stake');
    } else if (action.label === 'Deploy') {
      navigate('/deploy');
    } else if (action.label === 'Interact') {
      navigate('/interact');
    } else if (action.label === 'Generate') {
      navigate('/generate');
    } else if (action.label === 'Audit') {
      navigate('/audit');
    } else if (action.label === 'Research') {
      navigate('/research');
    } else {
      onSelect(action.prompt);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 px-2 sm:px-4 w-full max-w-2xl">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.label}
          onClick={() => handleAction(action)}
          className={cn(
            "group relative flex flex-col items-center gap-1.5 sm:gap-2 rounded-xl p-3 sm:p-4",
            "bg-card/50 border border-border/50 transition-all duration-200",
            "hover:bg-card hover:border-primary/30 hover:shadow-md"
          )}
        >
          {action.badge && (
            <span className="absolute -top-2 -right-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
              {action.badge}
            </span>
          )}
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <action.icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm font-medium">{action.label}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">{action.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
