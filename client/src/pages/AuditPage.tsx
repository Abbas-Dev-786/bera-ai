import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatView } from '@/components/chat/ChatView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getAudits, ContractAudit } from '@/lib/api';
import { toast } from 'sonner';

export default function AuditPage() {
  const [audits, setAudits] = useState<ContractAudit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    setIsLoading(true);
    try {
      const data = await getAudits({ limit: 20 });
      setAudits(data.audits);
    } catch (error) {
      console.error('Failed to load audits:', error);
      toast.error('Failed to load audits');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreVariant = (score: number | null) => {
    if (score === null) return 'secondary';
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const AuditSidePanel = (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm">Quick Scan</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          <Input placeholder="Contract address..." />
          <Button className="w-full" size="sm" onClick={loadAudits}>Scan</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold px-1">Recent Audits</h3>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : audits.length === 0 ? (
          <div className="text-center p-8 text-sm text-muted-foreground">
            No audits found. Run an audit using the chat!
          </div>
        ) : (
          audits.map((audit) => (
            <Card key={audit.auditId} className="cursor-pointer hover:bg-card/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm truncate max-w-[120px]">
                    {audit.artifactId ? `${audit.artifactId.slice(0, 8)}...` : 'Contract Audit'}
                  </span>
                  <Badge variant={getScoreVariant(audit.score)} className="text-xs">
                    {audit.score !== null ? `${audit.score}/100` : 'N/A'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="ml-auto">{formatDate(audit.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
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
        suggestions={[
          { label: "Audit Contract", text: "Audit this contract: [paste code]" },
          { label: "Check Security", text: "Check for reentrancy vulnerabilities" },
          { label: "Gas Optimization", text: "How can I optimize gas usage?" }
        ]}
      />
    </MainLayout>
  );
}
