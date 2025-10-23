import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle2, Banknote, CalendarCheck, Shield, Clock, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get the stock you need in four simple steps
            </p>
          </div>

          {/* Main Process */}
          <div className="max-w-4xl mx-auto mb-16">
            <div className="space-y-8">
              <Card className="shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">1. Apply Online</h3>
                      <p className="text-muted-foreground mb-3">
                        Complete our simple 4-step application form with your business details, preferred distributor information, and loan requirements. The entire process takes less than 10 minutes.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Business registration details</li>
                        <li>2+ years of operation required</li>
                        <li>Distributor till/paybill information</li>
                        <li>Loan amount: KSh 5,000 - 300,000</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">2. Quick Verification</h3>
                      <p className="text-muted-foreground mb-3">
                        Our team verifies your business information and assesses your application. We use automated systems combined with manual checks to ensure fast and accurate processing.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Instant credit assessment</li>
                        <li>Business verification</li>
                        <li>Distributor confirmation</li>
                        <li>Approval within hours</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange/10 text-orange flex items-center justify-center flex-shrink-0">
                      <Banknote size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">3. Direct Disbursement</h3>
                      <p className="text-muted-foreground mb-3">
                        Once approved, funds are sent directly to your supplier's M-PESA till or paybill number. This ensures the loan is used for its intended purpose and builds trust with distributors.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Instant M-PESA transfer</li>
                        <li>Direct to supplier account</li>
                        <li>Transaction confirmation</li>
                        <li>Digital receipt provided</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple/10 text-purple flex items-center justify-center flex-shrink-0">
                      <CalendarCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">4. Simple Repayment</h3>
                      <p className="text-muted-foreground mb-3">
                        Repay your loan in 7 days with 10% flat interest via M-PESA paybill. We'll send you reminders so you never miss a payment.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        <li>7-day repayment period</li>
                        <li>10% flat interest rate</li>
                        <li>M-PESA paybill payment</li>
                        <li>SMS & WhatsApp reminders</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="max-w-5xl mx-auto mb-12">
            <h2 className="text-2xl font-bold text-center mb-8">Why Choose Stock 24/7?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center shadow-elegant">
                <CardContent className="pt-6">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-accent" />
                  <h3 className="font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Funds disbursed in under 24 hours, so you never miss a business opportunity
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-elegant">
                <CardContent className="pt-6">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-success" />
                  <h3 className="font-semibold mb-2">100% Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is encrypted and protected. We never share your information
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center shadow-elegant">
                <CardContent className="pt-6">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 text-orange" />
                  <h3 className="font-semibold mb-2">Grow Your Business</h3>
                  <p className="text-sm text-muted-foreground">
                    Access to higher limits as you build your credit history with us
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center">
            <Link to="/apply">
              <Button variant="hero" size="lg">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
