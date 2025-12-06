import { ReactNode } from 'react';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAccount } from 'wagmi';
import ConnectBtn from '../ConnectBtn';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const {isConnected}=useAccount()

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-hidden">

          {isConnected ? children : <div className='flex items-center flex-col justify-center h-full'>
            <h3 className='text-3xl font-bold'>Connect wallet</h3>
            <p className='text-lg text-muted-foreground mb-3'>To start using BeraAI, please connect your wallet</p>
            <ConnectBtn/>
            </div>}

        </main>
      </div>
    </TooltipProvider>
  );
}
