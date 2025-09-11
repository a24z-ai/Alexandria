import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Library } from 'lucide-react';

interface ProductShowcaseProps {
  onShowLibrary: () => void;
}

export function ProductShowcase({ onShowLibrary }: ProductShowcaseProps) {
  return (
    <div className="min-h-[600px] flex flex-col items-center justify-center px-6">
      <div className="max-w-3xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-3 w-3" />
            Introducing Alexandria
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Your Agents,{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Orchestrated
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Alexandria is a Unified Context Layer, that makes documentation and context engineering as simple as adding lint to your codebase
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button 
            size="lg"
            onClick={() => {
              const basePath = window.location.pathname.includes('/Alexandria') ? '/Alexandria' : '';
              window.location.href = `${basePath}/repo?owner=a24z-ai&name=a24z-memory&view=setup-guide`;
            }}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => {
              const basePath = window.location.pathname.includes('/Alexandria') ? '/Alexandria' : '';
              window.location.href = `${basePath}/repo?owner=a24z-ai&name=a24z-memory&view=revenue-strategy`;
            }}
          >
            Roadmap
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={onShowLibrary}
          >
            <Library className="mr-2 h-4 w-4" />
            Explore
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="text-center pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            Trusted by developers building the next generation of AI applications
          </p>
        </div>
      </div>
    </div>
  );
}