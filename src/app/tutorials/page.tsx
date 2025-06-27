import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const financialLiteracyTopics = [
  {
    title: "Budgeting",
    description: "Learn how to plan, allocate, and track your income and expenses effectively.",
    link: "/tutorials/personal/budgeting",
  },
  {
    title: "Savings",
    description: "Understand strategies for saving consistently and setting financial goals.",
    link: "/tutorials/personal/savings",
  },
  {
    title: "Debt Management",
    description: "Master the art of handling loans and repayments wisely.",
    link: "/tutorials/personal/debt-management",
  },
  {
    title: "Risk Management",
    description: "Learn to identify financial risks and protect your assets.",
    link: "/tutorials/personal/risk-management",
  },
];

const entrepreneurshipTopics = [
  {
    title: "Business Idea Generation",
    description: "Discover how to identify viable business opportunities.",
    link: "/tutorials/entrepreneurship/business-idea-generation",
  },
  {
    title: "Business Planning",
    description: "Learn how to structure, plan, and pitch your business idea.",
    link: "/tutorials/entrepreneurship/business-planning",
  },
  {
    title: "Startup Strategy",
    description: "Gain insights on how to build, fund, and grow your business sustainably.",
    link: "/tutorials/entrepreneurship/strategy",
  },
];

const totTopics = [
  {
    title: "Facilitation Skills",
    description: "Learn how to teach and lead engaging, high-impact sessions.",
    link: "/tutorials/trainers/facilitation-skills",
  },
  {
    title: "Certification Path",
    description: "Become a GoldPlus Certified Trainer.",
    link: "/tutorials/trainers/certification-path",
  },
  {
    title: "Content Delivery",
    description: "Understand how to adapt materials for different audiences.",
    link: "/tutorials/trainers/content-delivery",
  },
];

export default function TutorialsPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background image with overlay */}
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
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold">GoldPlus Training Programs</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Your journey to financial and entrepreneurial mastery starts here.
          </p>
        </header>

        <main className="space-y-16">
          <section id="personal-finance">
            <Card className="glass-card overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
              <CardHeader className="bg-transparent">
                <CardTitle className="text-3xl">Financial Literacy Training</CardTitle>
                <CardDescription className="text-base">
                  We help individuals build strong financial foundations and habits.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Core Topics:</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {financialLiteracyTopics.map((topic) => (
                    <div key={topic.title} className="p-4 rounded-lg transition-all duration-300 hover:bg-white/10 hover:shadow-lg">
                      <h4 className="font-semibold text-lg">{topic.title}</h4>
                      <p className="text-muted-foreground my-2">{topic.description}</p>
                      <Link href={topic.link} className="text-sm font-semibold text-primary hover:underline">
                        Learn More &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="entrepreneurship">
            <Card className="glass-card overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
              <CardHeader className="bg-transparent">
                <CardTitle className="text-3xl">🚀 Entrepreneurship Training</CardTitle>
                <CardDescription className="text-base">
                  Designed for aspiring entrepreneurs and early-stage startups.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">What You'll Learn:</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {entrepreneurshipTopics.map((topic) => (
                    <div key={topic.title} className="p-4 rounded-lg transition-all duration-300 hover:bg-white/10 hover:shadow-lg">
                      <h4 className="font-semibold text-lg">{topic.title}</h4>
                      <p className="text-muted-foreground my-2">{topic.description}</p>
                      <Link href={topic.link} className="text-sm font-semibold text-primary hover:underline">
                        Learn More &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="tot">
            <Card className="glass-card overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
              <CardHeader className="bg-transparent">
                <CardTitle className="text-3xl">🧑‍🏫 Training of Trainers (ToT)</CardTitle>
                <CardDescription className="text-base">
                  We also train individuals who want to become professional trainers and educators in the financial or entrepreneurial space.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Focus Areas:</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {totTopics.map((topic) => (
                    <div key={topic.title} className="p-4 rounded-lg transition-all duration-300 hover:bg-white/10 hover:shadow-lg">
                      <h4 className="font-semibold text-lg">{topic.title}</h4>
                      <p className="text-muted-foreground my-2">{topic.description}</p>
                      <Link href={topic.link} className="text-sm font-semibold text-primary hover:underline">
                        Learn More &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <footer className="text-center mt-12 py-6 border-t">
            <h2 className="text-2xl font-bold">📌 Why Choose GoldPlus Training?</h2>
            <div className="max-w-3xl mx-auto mt-4 grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-muted-foreground">
                <p>Practical, real-world learning</p>
                <p>Expert facilitators</p>
                <p>Certification opportunities</p>
                <p>Tailored content for all</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
} 