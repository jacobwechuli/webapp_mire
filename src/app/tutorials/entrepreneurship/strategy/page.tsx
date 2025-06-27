export default function StrategyPage() {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/images/tutorials.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
          filter: 'brightness(0.7) blur(1px)',
        }}
      />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold">Startup Strategy</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Gain insights on how to build, fund, and grow your business sustainably.
        </p>
      </div>
    </div>
  );
} 