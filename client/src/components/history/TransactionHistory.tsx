import { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  Send,
  Coins,
  Rocket,
  Code2,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTransactionHistory, Transaction } from '@/lib/api';
import { cn } from '@/lib/utils';

const TYPE_ICONS: Record<Transaction['type'], React.ComponentType<{ className?: string }>> = {
  swap: ArrowRightLeft,
  transfer: Send,
  stake: Coins,
  deploy: Rocket,
  interact: Code2,
};

const STATUS_STYLES: Record<Transaction['status'], { icon: React.ComponentType<{ className?: string }>; className: string }> = {
  success: { icon: CheckCircle2, className: 'text-success' },
  failed: { icon: XCircle, className: 'text-destructive' },
  pending: { icon: Clock, className: 'text-warning' },
};

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await getTransactionHistory();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Your recent on-chain activities and audit trail
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No transactions yet. Start by executing a swap or transfer.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const TypeIcon = TYPE_ICONS[tx.type];
              const StatusInfo = STATUS_STYLES[tx.status];
              const StatusIcon = StatusInfo.icon;

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium capitalize">{tx.type}</span>
                        <StatusIcon className={cn('h-4 w-4', StatusInfo.className)} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tx.amount}
                        {tx.to && ` → ${tx.to}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatTime(tx.timestamp)}
                      </p>
                      {tx.gasUsed && (
                        <p className="text-xs text-muted-foreground">
                          Gas: {tx.gasUsed}
                        </p>
                      )}
                    </div>
                    {tx.hash && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a
                          href={`https://testnet.bscscan.com/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
