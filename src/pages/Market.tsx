import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Shield, TrendingUp, Users, Sparkles } from "lucide-react";

const products = [
  {
    icon: Package,
    title: "Distributor Deals",
    description: "Connect with verified liquor distributors offering competitive rates and reliable supply.",
    gradient: "bg-gradient-card",
    textColor: "text-accent",
  },
  {
    icon: ShoppingCart,
    title: "Business Tools",
    description: "Access POS systems, inventory management software, and digital payment solutions.",
    gradient: "bg-gradient-orange",
    textColor: "text-orange",
  },
  {
    icon: Shield,
    title: "Insurance Cover",
    description: "Protect your inventory and business with tailored insurance packages for liquor businesses.",
    gradient: "bg-gradient-purple",
    textColor: "text-purple",
  },
  {
    icon: TrendingUp,
    title: "Growth Loans",
    description: "Expand your business with longer-term financing options for renovations and expansion.",
    gradient: "bg-gradient-card",
    textColor: "text-accent",
  },
  {
    icon: Users,
    title: "Partner Network",
    description: "Join our network of liquor businesses and access exclusive deals and insights.",
    gradient: "bg-gradient-orange",
    textColor: "text-orange",
  },
  {
    icon: Sparkles,
    title: "Premium Services",
    description: "VIP access to industry events, training programs, and business development resources.",
    gradient: "bg-gradient-purple",
    textColor: "text-purple",
  },
];

const Market = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Market <span className="text-accent">Place</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover products and services designed to help your liquor business thrive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {products.map((product, index) => (
              <Card 
                key={index} 
                className="overflow-hidden border-none shadow-elegant hover:shadow-hover transition-all duration-300 group"
              >
                <div className={`h-2 ${product.gradient}`} />
                <CardHeader>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4 ${product.textColor}`}>
                    <product.icon size={24} />
                  </div>
                  <CardTitle className="text-xl">{product.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Want to become a partner?</p>
            <Link to="/contact">
              <Button variant="hero" size="lg">
                Partner with Us
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Market;
