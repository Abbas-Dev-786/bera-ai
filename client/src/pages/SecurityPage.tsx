import { Shield, AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MobileMenuTrigger } from '@/components/sidebar/AppSidebar';

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

export default function SecurityPage() {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <MainLayout>
      <div className="flex h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2">
            <MobileMenuTrigger />
            <h1 className="text-lg md:text-xl font-semibold">Security Center</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl space-y-4 md:space-y-6">
            {/* Quick Scan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Quick Security Scan
                </CardTitle>
                <CardDescription>
                  Analyze any contract or token address for potential risks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter contract address or paste code..."
                    className="flex-1"
                  />
                  <Button className="gap-2">
                    <Search className="h-4 w-4" />
                    Analyze
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Audits */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Audits</CardTitle>
                <CardDescription>
                  Security analysis history for your contracts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {RECENT_AUDITS.map((audit) => (
                  <div
                    key={audit.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border p-3 md:p-4 transition-colors hover:bg-card"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div
                        className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-lg shrink-0 ${
                          audit.score >= 80
                            ? 'bg-success/10'
                            : audit.score >= 60
                            ? 'bg-warning/10'
                            : 'bg-destructive/10'
                        }`}
                      >
                        {audit.score >= 80 ? (
                          <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-success" />
                        ) : (
                          <AlertTriangle
                            className={`h-5 w-5 md:h-6 md:w-6 ${
                              audit.score >= 60
                                ? 'text-warning'
                                : 'text-destructive'
                            }`}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{audit.name}</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>{audit.date}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            {audit.issues.critical > 0 && (
                              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                                {audit.issues.critical} critical
                              </Badge>
                            )}
                            {audit.issues.high > 0 && (
                              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                {audit.issues.high} high
                              </Badge>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4 ml-13 sm:ml-0">
                      <div className="w-24 md:w-32">
                        <Progress value={audit.score} className="h-2" />
                      </div>
                      <Badge variant={getScoreVariant(audit.score)}>
                        {audit.score}/100
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Security Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Security Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    Always audit contracts before deploying to mainnet
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    Use testnet mode for development and testing
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    Set reasonable spend caps and transaction limits
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    Review transaction details before confirming
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
