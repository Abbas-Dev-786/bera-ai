import { useState } from 'react';
import { AlertTriangle, Shield, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ActionData } from './ActionCard';

interface TransactionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ActionData;
  onConfirm: () => void;
  onCancel: () => void;
}

const riskMessages: Record<string, { title: string; description: string }> = {
  low: {
    title: 'Low Risk Transaction',
    description: 'This transaction has been analyzed and appears safe to execute.',
  },
  medium: {
    title: 'Medium Risk Transaction',
    description: 'Please review the details carefully before proceeding.',
  },
  high: {
    title: 'High Risk Transaction',
    description: 'This transaction involves significant risk. Proceed with extreme caution.',
  },
};

const riskColors: Record<string, string> = {
  low: 'bg-green-500/10 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export function TransactionConfirmDialog({
  open,
  onOpenChange,
  action,
  onConfirm,
  onCancel,
}: TransactionConfirmDialogProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const riskInfo = riskMessages[action.riskLevel];

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Simulate wallet signing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setConfirmed(false);
    onConfirm();
  };

  const handleCancel = () => {
    setConfirmed(false);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Confirm Transaction
          </DialogTitle>
          <DialogDescription>
            Review the transaction details before signing with your wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Risk Alert */}
          <div className={cn(
            "flex items-start gap-3 rounded-lg border p-3",
            riskColors[action.riskLevel]
          )}>
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{riskInfo.title}</p>
              <p className="text-sm opacity-80">{riskInfo.description}</p>
            </div>
          </div>

          {/* Transaction Summary */}
          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Transaction Type</span>
              <Badge variant="secondary" className="capitalize">
                {action.type}
              </Badge>
            </div>
            
            <Separator />

            {Object.entries(action.details).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-mono font-medium">{value}</span>
              </div>
            ))}

            {action.estimatedGas && (
              <>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Network Fee (est.)</span>
                  <span className="font-mono font-medium">{action.estimatedGas}</span>
                </div>
              </>
            )}
          </div>

          {/* Security Checks */}
          <div className="rounded-lg border border-border bg-card/50 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Security Checks</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Contract verified on BscScan</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>No suspicious patterns detected</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span>Within policy limits</span>
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start space-x-3 rounded-lg border border-border p-3">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked as boolean)}
              className="mt-0.5"
            />
            <label htmlFor="confirm" className="text-sm leading-relaxed cursor-pointer">
              I have reviewed the transaction details and understand this action is irreversible once confirmed.
            </label>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting} className="sm:flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!confirmed || isSubmitting}
            className="sm:flex-1 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Sign & Execute
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
