import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Percent, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const loanTypes = [
  { name: "Quick Stock Loan", amount: "KSh 5,000 – 50,000", term: "7 days", rate: "10% flat", desc: "Emergency restocking for fast-moving products.", color: "bg-accent/10" },
  { name: "Growth Loan", amount: "KSh 50,000 – 150,000", term: "14-30 days", rate: "8-12%", desc: "Expand your product range and increase shelf space.", color: "bg-secondary/10" },
  { name: "Expansion Loan", amount: "KSh 150,000 – 300,000", term: "30-60 days", rate: "7-10%", desc: "Renovate, relocate, or open a second outlet.", color: "bg-accent/10" },
  { name: "Distributor Credit Line", amount: "Up to KSh 500,000", term: "Revolving", rate: "From 6%", desc: "Pre-approved credit line with your distributor. Draw down as needed.", color: "bg-secondary/10" },
];

const GrowthLoans = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <main className="pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Growth <span className="text-accent">Loans</span></h1>
          <p className="text-muted-foreground">Financing options to scale your business</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {loanTypes.map((l, i) => (
            <Card key={i} className="border-none shadow-elegant hover:shadow-hover transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{l.name}</CardTitle>
                <CardDescription className="text-xs">{l.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`rounded-lg p-3 ${l.color} space-y-2`}>
                  <div className="flex items-center gap-2 text-sm"><TrendingUp size={14} className="text-accent" /><span className="font-semibold">{l.amount}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Clock size={14} className="text-accent" /><span>{l.term}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Percent size={14} className="text-accent" /><span>{l.rate}</span></div>
                </div>
                <Link to="/apply"><Button variant="hero" size="sm" className="w-full">Apply Now <ArrowRight size={14} /></Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
    <Footer />
    <MobileBottomNav />
  </div>
);

export default GrowthLoans;
