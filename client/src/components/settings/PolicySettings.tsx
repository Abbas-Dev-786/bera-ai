import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPolicySettings, updatePolicySettings, PolicySettings as PolicySettingsType } from '@/lib/api';
import { toast } from 'sonner';

export function PolicySettings() {
  const [settings, setSettings] = useState<PolicySettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getPolicySettings();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updatePolicySettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Network Mode
          </CardTitle>
          <CardDescription>
            Choose between testnet and mainnet for transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Testnet Mode</Label>
              <p className="text-sm text-muted-foreground">
                {settings.testnetMode
                  ? 'Using BNB Testnet (safe for testing)'
                  : 'Using BNB Mainnet (real funds)'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {settings.testnetMode ? (
                <Badge variant="secondary">Testnet</Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Mainnet
                </Badge>
              )}
              <Switch
                checked={settings.testnetMode}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, testnetMode: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spend Limits */}
      <Card>
        <CardHeader>
          <CardTitle>Spend Limits</CardTitle>
          <CardDescription>
            Set maximum amounts for transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dailyCap">Daily Spend Cap (USD)</Label>
              <Input
                id="dailyCap"
                type="number"
                value={settings.dailySpendCap}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dailySpendCap: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="perTxLimit">Per Transaction Limit (USD)</Label>
              <Input
                id="perTxLimit"
                type="number"
                value={settings.perTxLimit}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    perTxLimit: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Safety Controls</CardTitle>
          <CardDescription>
            Configure additional security measures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Require Confirmation</Label>
              <p className="text-sm text-muted-foreground">
                Always ask for confirmation before executing transactions
              </p>
            </div>
            <Switch
              checked={settings.requireConfirmation}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, requireConfirmation: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Allowed Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Allowed Tokens</CardTitle>
          <CardDescription>
            Tokens that can be used in transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {settings.allowedTokens.map((token) => (
              <Badge key={token} variant="secondary" className="gap-1">
                <Check className="h-3 w-3" />
                {token}
              </Badge>
            ))}
            <Button variant="outline" size="sm" className="h-6">
              + Add Token
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
