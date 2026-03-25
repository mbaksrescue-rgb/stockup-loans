import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, GraduationCap, Palette, Megaphone, BarChart3, Headphones } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { icon: GraduationCap, name: "Business Training", desc: "Accounting, stock management, compliance, and customer service workshops.", price: "KSh 5,000/session", tag: "Popular" },
  { icon: Palette, name: "Branding & Design", desc: "Logo, signage, menu boards, and social media branding for your bar or shop.", price: "From KSh 15,000", tag: "" },
  { icon: Megaphone, name: "Digital Marketing", desc: "Google Business, social media ads, and local SEO to drive foot traffic.", price: "From KSh 8,000/mo", tag: "New" },
  { icon: BarChart3, name: "Business Consulting", desc: "One-on-one sessions with industry experts on growth strategy and optimization.", price: "KSh 10,000/session", tag: "" },
  { icon: Headphones, name: "VIP Support Line", desc: "Dedicated account manager, priority loan processing, and 24/7 support.", price: "KSh 3,000/mo", tag: "Premium" },
  { icon: Sparkles, name: "Industry Events Access", desc: "VIP passes to trade shows, product launches, tastings, and networking events.", price: "KSh 2,000/event", tag: "" },
];

const PremiumServices = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <main className="pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Premium <span className="text-accent">Services</span></h1>
          <p className="text-muted-foreground">Elevate your business with expert support</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {services.map((s, i) => (
            <Card key={i} className="border-none shadow-elegant hover:shadow-hover transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-accent">
                    <s.icon size={20} />
                  </div>
                  {s.tag && <Badge className="bg-accent text-accent-foreground text-[10px]">{s.tag}</Badge>}
                </div>
                <CardTitle className="text-base mt-2">{s.name}</CardTitle>
                <CardDescription className="text-xs">{s.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-accent text-sm">{s.price}</span>
                  <Link to="/contact"><Button variant="outline" size="sm">Enquire</Button></Link>
                </div>
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

export default PremiumServices;
