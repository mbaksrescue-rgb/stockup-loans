import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Star, Truck, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const distributors = [
  { name: "Kenya Wine Agencies (KWAL)", rating: 4.8, products: "Wines, Spirits, RTDs", delivery: "24hrs", discount: "5-12%", verified: true },
  { name: "East African Breweries (EABL)", rating: 4.9, products: "Beer, Spirits, Stout", delivery: "Same Day", discount: "3-8%", verified: true },
  { name: "Keroche Breweries", rating: 4.5, products: "Beer, Fortified Wine", delivery: "48hrs", discount: "4-10%", verified: true },
  { name: "Pernod Ricard Kenya", rating: 4.7, products: "Premium Spirits", delivery: "24-48hrs", discount: "5-15%", verified: true },
  { name: "Diageo Kenya", rating: 4.9, products: "Johnnie Walker, Smirnoff, Tusker", delivery: "Same Day", discount: "3-10%", verified: true },
  { name: "Maxam Ltd", rating: 4.3, products: "Budget Spirits, Vodka", delivery: "24hrs", discount: "8-15%", verified: true },
];

const DistributorDeals = () => (
  <div className="min-h-screen bg-background pb-20 md:pb-0">
    <Navbar />
    <main className="pt-20 pb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Distributor <span className="text-accent">Deals</span></h1>
          <p className="text-muted-foreground">Verified distributors with competitive rates</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {distributors.map((d, i) => (
            <Card key={i} className="border-none shadow-elegant hover:shadow-hover transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{d.name}</CardTitle>
                  {d.verified && <Badge variant="secondary" className="text-[10px] bg-accent/10 text-accent"><Shield size={10} className="mr-1" />Verified</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package size={14} className="text-accent" />
                  <span>{d.products}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck size={14} className="text-accent" />
                  <span>Delivery: {d.delivery}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star size={14} className="text-accent" />
                  <span>{d.rating}/5 Rating</span>
                </div>
                <div className="bg-accent/10 rounded-lg p-2 text-center">
                  <span className="text-accent font-bold text-lg">{d.discount}</span>
                  <span className="text-xs text-muted-foreground block">Bulk Discount</span>
                </div>
                <Link to="/contact">
                  <Button variant="hero" size="sm" className="w-full">Connect Now</Button>
                </Link>
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

export default DistributorDeals;
