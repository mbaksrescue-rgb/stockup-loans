import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Shield, TrendingUp, Users, Sparkles, ArrowRight } from "lucide-react";

const products = [
  {
    icon: Package,
    title: "Distributor Deals",
    description: "Connect with verified liquor distributors offering competitive rates and reliable supply.",
    gradient: "bg-gradient-card",
    textColor: "text-accent",
    link: "/market/distributors",
  },
  {
    icon: ShoppingCart,
    title: "Business Tools",
    description: "Access POS systems, inventory management software, and digital payment solutions.",
    gradient: "bg-gradient-orange",
    textColor: "text-accent",
    link: "/market/tools",
  },
  {
    icon: Shield,
    title: "Insurance Cover",
    description: "Protect your inventory and business with tailored insurance packages for liquor businesses.",
    gradient: "bg-gradient-purple",
    textColor: "text-accent",
    link: "/market/insurance",
  },
  {
    icon: TrendingUp,
    title: "Growth Loans",
    description: "Expand your business with longer-term financing options for renovations and expansion.",
    gradient: "bg-gradient-card",
    textColor: "text-accent",
    link: "/market/loans",
  },
  {
    icon: Users,
    title: "Partner Network",
    description: "Join our network of liquor businesses and access exclusive deals and insights.",
    gradient: "bg-gradient-orange",
    textColor: "text-accent",
    link: "/market/partners",
  },
  {
    icon: Sparkles,
    title: "Premium Services",
    description: "VIP access to industry events, training programs, and business development resources.",
    gradient: "bg-gradient-purple",
    textColor: "text-accent",
    link: "/market/premium",
  },
];

const Market = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Market <span className="text-accent">Place</span>
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Products and services designed to help your liquor business thrive
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 max-w-6xl mx-auto">
            {products.map((product, index) => (
              <Link to={product.link} key={index} className="block">
                <Card className="overflow-hidden border-none shadow-elegant hover:shadow-hover transition-all duration-300 group h-full">
                  <div className={`h-1.5 ${product.gradient}`} />
                  <CardHeader className="p-3 md:p-6 pb-1 md:pb-2">
                    <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent/10 mb-2 ${product.textColor}`}>
                      <product.icon size={20} />
                    </div>
                    <CardTitle className="text-sm md:text-lg leading-tight">{product.title}</CardTitle>
                    <CardDescription className="text-[11px] md:text-sm line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 md:p-6 pt-1 md:pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs md:text-sm group-hover:bg-accent group-hover:text-accent-foreground transition-colors"
                    >
                      Explore <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-muted-foreground text-sm mb-3">Want to become a partner?</p>
            <Link to="/contact">
              <Button variant="hero" size="lg">Partner with Us</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Market;
