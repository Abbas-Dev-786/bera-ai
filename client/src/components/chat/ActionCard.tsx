import { useState } from 'react';
import { ArrowRightLeft, Send, Coins, FileCode, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TransactionConfirmDialog } from './TransactionConfirmDialog';

export type ActionType = 'swap' | 'transfer' | 'stake' | 'deploy' | 'interact';
export type ActionStatus = 'pending' | 'signing' | 'executing' | 'completed' | 'failed' | 'rejected';

export interface ActionData {
  id: string;
  type: ActionType;
  status: ActionStatus;
  title: string;
  description: string;
  details: Record<string, string>;
  riskLevel: 'low' | 'medium' | 'high';
  estimatedGas?: string;
  timestamp: Date;
}

interface ActionCardProps {
  action: ActionData;
  onApprove?: (actionId: string) => void;
  onReject?: (actionId: string) => void;
}

const actionIcons: Record<ActionType, React.ElementType> = {
  swap: ArrowRightLeft,
  transfer: Send,
  stake: Coins,
  deploy: FileCode,
  interact: FileCode,
};

const actionColors: Record<ActionType, string> = {
  swap: 'from-blue-500 to-cyan-500',
  transfer: 'from-green-500 to-emerald-500',
  stake: 'from-purple-500 to-pink-500',
  deploy: 'from-orange-500 to-amber-500',
  interact: 'from-indigo-500 to-violet-500',
};

const riskColors: Record<string, string> = {
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusConfig: Record<ActionStatus, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'Awaiting Approval', icon: AlertTriangle, className: 'text-yellow-400' },
  signing: { label: 'Sign in Wallet', icon: Loader2, className: 'text-blue-400 animate-pulse' },
  executing: { label: 'Executing...', icon: Loader2, className: 'text-primary animate-spin' },
  completed: { label: 'Completed', icon: CheckCircle2, className: 'text-green-400' },
  failed: { label: 'Failed', icon: XCircle, className: 'text-red-400' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'text-muted-foreground' },
};

export function ActionCard({ action, onApprove, onReject }: ActionCardProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const Icon = actionIcons[action.type];
  const status = statusConfig[action.status];
  const StatusIcon = status.icon;
  const isPending = action.status === 'pending';

  const handleApprove = () => {
    setShowConfirmDialog(false);
    onApprove?.(action.id);
  };

  const handleReject = () => {
    setShowConfirmDialog(false);
    onReject?.(action.id);
  };

  return (
    <>
      <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
                actionColors[action.type]
              )}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold">{action.title}</h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
            <Badge variant="outline" className={cn("text-xs", riskColors[action.riskLevel])}>
              {action.riskLevel} risk
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="rounded-lg bg-secondary/30 p-3 space-y-2">
            {Object.entries(action.details).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-medium font-mono">{value}</span>
              </div>
            ))}
            {action.estimatedGas && (
              <div className="flex items-center justify-between text-sm border-t border-border/50 pt-2 mt-2">
                <span className="text-muted-foreground">Estimated Gas</span>
                <span className="font-medium font-mono">{action.estimatedGas}</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-border/50 bg-secondary/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-4 w-4", status.className)} />
            <span className={cn("text-sm font-medium", status.className)}>{status.label}</span>
          </div>

          {isPending && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReject?.(action.id)}
                className="flex-1 sm:flex-initial text-muted-foreground hover:text-destructive"
              >
                Reject
              </Button>
              <Button
                size="sm"
                onClick={() => setShowConfirmDialog(true)}
                className="flex-1 sm:flex-initial bg-primary hover:bg-primary/90"
              >
                Review & Sign
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      <TransactionConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        action={action}
        onConfirm={handleApprove}
        onCancel={handleReject}
      />
    </>
  );
}
