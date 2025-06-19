import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Coins, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            {/* <Coins className="h-8 w-8 text-primary mr-2" /> */}
            <h1 className="text-2xl font-bold text-primary font-headline">GoldPlus</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-background to-secondary">
        <div className="max-w-3xl">
          <Image 
            src="/images/goldplus-logo.png" 
            alt="Financial planning illustration" 
            width={600} 
            height={400} 
            className="mx-auto mb-12 rounded-lg shadow-2xl"
            data-ai-hint="finance planning"
          />
          <h2 className="text-5xl md:text-6xl font-bold text-primary mb-6 font-headline tracking-tight">
            Take control of your finance.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
            GoldPlus helps you manage your income, track expenses, and achieve your financial goals with ease and precision.
          </p>
          <Link href="/login" passHref>
            <Button size="lg" variant="gold" className="px-10 py-6">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </main>

      <footer className="py-6 md:px-8 border-t bg-card">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-20">
          <p className="text-sm text-center text-muted-foreground">
            © {new Date().getFullYear()} GoldPlus. Your journey to financial freedom starts here.
          </p>
        </div>
      </footer>
    </div>
  );
}
