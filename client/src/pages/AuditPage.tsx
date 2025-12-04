import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const RECENT_AUDITS = [
  {
    id: '1',
    name: 'MyToken.sol',
    score: 92,
    issues: { critical: 0, high: 0, medium: 1, low: 2 },
    date: '2 hours ago',
  },
  {
    id: '2',
    name: 'StakingPool.sol',
    score: 87,
    issues: { critical: 0, high: 1, medium: 2, low: 3 },
    date: '1 day ago',
  },
  {
    id: '3',
    name: 'Unknown Contract',
    score: 45,
    issues: { critical: 2, high: 3, medium: 4, low: 1 },
    date: '3 days ago',
  },
];

export default function AuditPage() {
  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const AuditSidePanel = (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Quick Scan</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <Input placeholder="Contract address..." />
          <Button className="w-full" size="sm">Scan</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold px-1">Recent Audits</h3>
        {RECENT_AUDITS.map((audit) => (
          <Card key={audit.id} className="cursor-pointer hover:bg-card/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm truncate max-w-[120px]">{audit.name}</span>
                <Badge variant={getScoreVariant(audit.score)} className="text-xs">
                  {audit.score}/100
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {audit.issues.critical > 0 && (
                  <span className="text-destructive font-medium">{audit.issues.critical} crit</span>
                )}
                {audit.issues.high > 0 && (
                  <span className="text-orange-500">{audit.issues.high} high</span>
                )}
                <span className="ml-auto">{audit.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <MainLayout>
      <ChatView 
        title="Smart Contract Audit"
        subtitle="Analyze code for vulnerabilities"
        placeholder="Example: Audit 0x..."
        initialItems={[{
          type: 'message',
          data: {
            id: 'welcome-audit',
            role: 'assistant',
            content: 'I can help you audit smart contracts for security vulnerabilities. Paste the contract code or address, and I will analyze it for you.',
            timestamp: new Date()
          }
        }]}
        sidePanel={AuditSidePanel}
      />
    </MainLayout>
  );
}
