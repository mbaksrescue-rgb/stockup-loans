import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Award, TrendingUp, MessageCircle, Calendar, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const benefits = [
  { icon: Users, title: "500+ Members", desc: "Join a growing community of liquor business owners across Kenya." },
  { icon: Award, title: "Exclusive Deals", desc: "Members-only pricing from top distributors and suppliers." },
  { icon: TrendingUp, title: "Business Insights", desc: "Monthly reports on market trends, best-sellers, and pricing." },
  { icon: MessageCircle, title: "WhatsApp Community", desc: "Connect with peers, share tips, and get real-time support." },
  { icon: Calendar, title: "Industry Events", desc: "Invitations to trade shows, product launches, and networking." },
  { icon: Zap, title: "Priority Loans", desc: "Network members get faster loan processing and better rates." },
];

const PartnerNetwork = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <main className="pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Partner <span className="text-accent">Network</span></h1>
          <p className="text-muted-foreground">Grow together with Kenya's largest liquor business network</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {benefits.map((b, i) => (
            <Card key={i} className="border-none shadow-elegant text-center hover:shadow-hover transition-all">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <b.icon size={22} />
                </div>
                <CardTitle className="text-base mt-2">{b.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/contact"><Button variant="hero" size="lg">Join the Network</Button></Link>
        </div>
      </div>
    </main>
    <Footer />
    <MobileBottomNav />
  </div>
);

export default PartnerNetwork;
