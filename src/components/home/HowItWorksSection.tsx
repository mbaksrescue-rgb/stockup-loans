import { CheckCircle2, FileText, Banknote, CalendarCheck } from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Apply",
    description: "Submit your business and distributor details in minutes",
    color: "text-accent",
  },
  {
    icon: CheckCircle2,
    title: "Verify",
    description: "We quickly verify your information and approve your loan",
    color: "text-success",
  },
  {
    icon: Banknote,
    title: "Disburse",
    description: "Funds sent directly to your supplier's till or paybill",
    color: "text-orange",
  },
  {
    icon: CalendarCheck,
    title: "Repay",
    description: "Simple 7-day repayment with 10% flat interest",
    color: "text-purple",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get the stock you need in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-card rounded-xl p-6 shadow-elegant hover:shadow-hover transition-all duration-300 h-full">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 ${step.color}`}>
                  <step.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
