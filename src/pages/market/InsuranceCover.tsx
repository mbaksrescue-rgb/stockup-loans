import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Flame, Droplets, AlertTriangle, Users, FileCheck } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  { icon: Shield, name: "Stock Protection", desc: "Covers your entire inventory against theft, damage, and spoilage up to KSh 5M.", price: "From KSh 3,500/mo", features: ["Theft & burglary", "Fire damage", "Stock spoilage", "24hr claims"] },
  { icon: Flame, name: "Fire & Disaster", desc: "Comprehensive fire, flood, and natural disaster coverage for premises and stock.", price: "From KSh 5,000/mo", features: ["Fire & explosion", "Flood damage", "Earthquake", "Business interruption"] },
  { icon: Users, name: "Employee Cover", desc: "Workers compensation and group personal accident cover for your staff.", price: "From KSh 1,500/mo", features: ["Medical cover", "Work injuries", "Group life", "Maternity"] },
  { icon: FileCheck, name: "Compliance Package", desc: "License renewal support, regulatory compliance, and legal protection.", price: "From KSh 2,000/mo", features: ["License support", "Legal defense", "Regulatory fines", "Audit cover"] },
];

const InsuranceCover = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <main className="pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Insurance <span className="text-accent">Cover</span></h1>
          <p className="text-muted-foreground">Protect your business with tailored insurance</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {plans.map((p, i) => (
            <Card key={i} className="border-none shadow-elegant hover:shadow-hover transition-all">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-accent">
                  <p.icon size={20} />
                </div>
                <CardTitle className="text-base mt-2">{p.name}</CardTitle>
                <CardDescription className="text-xs">{p.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-1">
                  {p.features.map((f, j) => (
                    <li key={j} className="text-xs text-muted-foreground flex items-center gap-2">
                      <Shield size={10} className="text-accent" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t">
                  <span className="font-bold text-accent text-sm">{p.price}</span>
                </div>
                <Link to="/contact"><Button variant="hero" size="sm" className="w-full">Get Quote</Button></Link>
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

export default InsuranceCover;
