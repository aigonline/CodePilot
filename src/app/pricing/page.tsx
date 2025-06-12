import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const pricingPlans = [
  {
    name: "Developer",
    price: "$0",
    frequency: "/month",
    description: "For individual developers getting started.",
    features: [
      "Basic code generation",
      "Limited history",
      "Community support",
    ],
    cta: "Get Started",
    href: "/auth/signup?plan=developer"
  },
  {
    name: "Pro",
    price: "$19",
    frequency: "/month",
    description: "For professionals needing more power.",
    features: [
      "Advanced code generation",
      "Unlimited history",
      "Code preview (HTML, CSS, JS)",
      "Priority support",
    ],
    cta: "Choose Pro",
    href: "/auth/signup?plan=pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$49",
    frequency: "/month",
    description: "For collaborative teams.",
    features: [
      "All Pro features",
      "Team collaboration tools",
      "Shared snippets",
      "Dedicated account manager",
    ],
    cta: "Contact Sales",
    href: "/contact-sales"
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-primary">
          Flexible Pricing for Everyone
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
          Choose the plan that’s right for you and start generating code smarter, not harder.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className={`rounded-2xl shadow-xl flex flex-col ${plan.popular ? 'border-2 border-primary ring-2 ring-primary/50' : 'border-border'}`}>
            {plan.popular && (
              <div className="py-1 px-4 bg-primary text-primary-foreground text-sm font-semibold rounded-t-xl text-center">
                Most Popular
              </div>
            )}
            <CardHeader className="p-8 text-center">
              <CardTitle className="text-2xl font-bold text-foreground">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-extrabold text-primary">{plan.price}</span>
                <span className="text-base font-medium text-muted-foreground">{plan.frequency}</span>
              </div>
              <CardDescription className="mt-4 text-muted-foreground">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 flex-grow">
              <ul role="list" className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-6 w-6 text-emerald-500" aria-hidden="true" />
                    </div>
                    <p className="ml-3 text-base text-foreground">{feature}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="p-8 pt-0 mt-auto">
              <Button asChild className="w-full rounded-xl py-3 text-base bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
       <div className="mt-16 text-center">
        <p className="text-muted-foreground">
          Need a custom solution or have questions? <Link href="/contact-us" className="font-medium text-primary hover:underline">Contact us</Link>.
        </p>
      </div>
    </div>
  );
}
