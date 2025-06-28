export default function CertificationPathPage() {
  return (
    <div className="relative min-h-screen bg-white text-black">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/images/tutorials.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          filter: 'brightness(1.2) blur(1px)',
        }}
      />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-black">Certification Path</h1>
        <p className="text-lg text-black/80 mt-2">
          Become a GoldPlus Certified Trainer.
        </p>
      </div>
    </div>
  );
} 