import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, CreditCard, BarChart3, Package, Wifi } from "lucide-react";
import { Link } from "react-router-dom";

const tools = [
  { icon: Monitor, name: "POS System Pro", desc: "Complete point-of-sale system with inventory tracking, sales reports, and M-PESA integration.", price: "KSh 15,000/yr", tag: "Popular" },
  { icon: Smartphone, name: "Stock Manager App", desc: "Mobile inventory management. Scan barcodes, track stock levels, get reorder alerts.", price: "KSh 500/mo", tag: "New" },
  { icon: CreditCard, name: "Digital Payments Hub", desc: "Accept M-PESA, card payments, and bank transfers. Instant settlement.", price: "1.5% per txn", tag: "" },
  { icon: BarChart3, name: "Sales Analytics Dashboard", desc: "Real-time sales data, profit margins, bestseller reports, and customer insights.", price: "KSh 800/mo", tag: "" },
  { icon: Package, name: "Order Management System", desc: "Automate orders to distributors. Set reorder points and auto-replenish stock.", price: "KSh 1,200/mo", tag: "Recommended" },
  { icon: Wifi, name: "Smart CCTV + WiFi Bundle", desc: "Security cameras with cloud storage and business WiFi for your premises.", price: "KSh 25,000", tag: "" },
];

const BusinessTools = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <main className="pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Business <span className="text-accent">Tools</span></h1>
          <p className="text-muted-foreground">Technology solutions for modern liquor businesses</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {tools.map((t, i) => (
            <Card key={i} className="border-none shadow-elegant hover:shadow-hover transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <t.icon size={20} />
                  </div>
                  {t.tag && <Badge className="bg-accent text-accent-foreground text-[10px]">{t.tag}</Badge>}
                </div>
                <CardTitle className="text-base mt-2">{t.name}</CardTitle>
                <CardDescription className="text-xs">{t.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-accent">{t.price}</span>
                  <Link to="/contact"><Button variant="outline" size="sm">Get Started</Button></Link>
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

export default BusinessTools;
