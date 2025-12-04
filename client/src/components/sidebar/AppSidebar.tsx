import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  History,
  Settings,
  Shield,
  Plus,
  ChevronLeft,
  ChevronRight,
  Bot,
  FileCode,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: MessageSquare, label: 'Chat', path: '/' },
  { icon: History, label: 'History', path: '/history' },
  { icon: FileCode, label: 'Contracts', path: '/contracts' },
  { icon: Shield, label: 'Security', path: '/security' },
  { icon: BookOpen, label: 'Docs', path: '/docs' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

function SidebarContent({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Web3 Agent</span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start gap-2 border-dashed",
                collapsed && "justify-center px-0"
              )}
            >
              <Plus className="h-4 w-4" />
              {!collapsed && <span>New Chat</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">New Chat</TooltipContent>}
        </Tooltip>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </nav>

      {/* Recent Chats */}
      {!collapsed && (
        <div className="border-t border-border px-3 py-4">
          <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
            Recent Chats
          </p>
          <div className="space-y-1">
            {['Token swap help', 'Contract audit', 'DeFi strategies'].map(
              (chat) => (
                <button
                  key={chat}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{chat}</span>
                </button>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent collapsed={collapsed} />
        
        {/* Collapse Toggle */}
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar">
        <div className="flex h-full flex-col">
          <SidebarContent onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
