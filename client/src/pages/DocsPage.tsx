import { ExternalLink, Book, Code2, Shield, Zap } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileMenuTrigger } from '@/components/sidebar/AppSidebar';

const DOCS_SECTIONS = [
  {
    icon: Book,
    title: 'Getting Started',
    description: 'Learn the basics of using Web3 Super Agent',
    links: [
      { label: 'Quick Start Guide', href: '#' },
      { label: 'Understanding AI Commands', href: '#' },
      { label: 'Wallet Connection', href: '#' },
    ],
  },
  {
    icon: Code2,
    title: 'Smart Contracts',
    description: 'Generate and audit Solidity code',
    links: [
      { label: 'Contract Generation', href: '#' },
      { label: 'Audit Reports', href: '#' },
      { label: 'Deployment Guide', href: '#' },
    ],
  },
  {
    icon: Zap,
    title: 'Transactions',
    description: 'Execute swaps, transfers, and more',
    links: [
      { label: 'Token Swaps', href: '#' },
      { label: 'Token Transfers', href: '#' },
      { label: 'Staking & DeFi', href: '#' },
    ],
  },
  {
    icon: Shield,
    title: 'Security',
    description: 'Stay safe with policy controls',
    links: [
      { label: 'Spend Limits', href: '#' },
      { label: 'Allowlists', href: '#' },
      { label: 'Risk Analysis', href: '#' },
    ],
  },
];

const EXTERNAL_RESOURCES = [
  {
    title: 'ChainGPT Documentation',
    description: 'API reference and SDK guides',
    href: 'https://docs.chaingpt.org',
  },
  {
    title: 'BNB Chain Docs',
    description: 'BNB Chain developer resources',
    href: 'https://docs.bnbchain.org',
  },
  {
    title: 'Quack x402 Repository',
    description: 'x402 BNB sign-to-pay integration',
    href: 'https://github.com/quackai-labs/Q402',
  },
];

export default function DocsPage() {
  return (
    <MainLayout>
      <div className="flex h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2">
            <MobileMenuTrigger />
            <h1 className="text-lg md:text-xl font-semibold">Documentation</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-4xl space-y-6 md:space-y-8">
            {/* Main Sections */}
            <div className="grid gap-4 md:grid-cols-2">
              {DOCS_SECTIONS.map((section) => (
                <Card key={section.title}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.links.map((link) => (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* External Resources */}
            <Card>
              <CardHeader>
                <CardTitle>External Resources</CardTitle>
                <CardDescription>
                  Learn more about the technologies powering Web3 Super Agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {EXTERNAL_RESOURCES.map((resource) => (
                  <a
                    key={resource.title}
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-card"
                  >
                    <div>
                      <p className="font-medium">{resource.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {resource.description}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ))}
              </CardContent>
            </Card>

            {/* Help CTA */}
            <Card className="bg-gradient-to-br from-primary/5 to-purple-600/5 border-primary/20">
              <CardContent className="flex items-center justify-between py-6">
                <div>
                  <h3 className="font-semibold">Need Help?</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask the AI agent directly in chat for assistance
                  </p>
                </div>
                <Button>Go to Chat</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
