import { MainLayout } from '@/components/layout/MainLayout';
import { PolicySettings } from '@/components/settings/PolicySettings';
import { MobileMenuTrigger } from '@/components/sidebar/AppSidebar';

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="flex h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2">
            <MobileMenuTrigger />
            <h1 className="text-lg md:text-xl font-semibold">Settings</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-2xl">
            <PolicySettings />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
