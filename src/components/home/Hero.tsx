import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import bottleKenyaCane from "@/assets/bottle-kenya-cane.png";
import bottleJohnnieWalker from "@/assets/bottle-johnnie-walker.png";
import bottleRobertson from "@/assets/bottle-robertson.png";
import bottleVersus from "@/assets/bottle-versus.png";
import bottleGilbeys from "@/assets/bottle-gilbeys.png";

const bottles = [
  { src: bottleKenyaCane, alt: "Kenya Cane", position: "left-[2%]" },
  { src: bottleJohnnieWalker, alt: "Johnnie Walker Black Label", position: "left-[22%]" },
  { src: bottleRobertson, alt: "Robertson Winery", position: "left-[42%]" },
  { src: bottleVersus, alt: "Versus Sweet", position: "right-[22%]" },
  { src: bottleGilbeys, alt: "Gilbey's Gin", position: "right-[2%]" },
];

const Hero = () => {
  const [activeBottle, setActiveBottle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBottle((prev) => (prev + 1) % bottles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
      {/* Background bottles - clean and clear */}
      <div className="absolute inset-0 z-0 flex items-end justify-center">
        {bottles.map((bottle, index) => (
          <div
            key={bottle.alt}
            className={`absolute bottom-0 ${bottle.position} transition-all duration-1000 ease-in-out ${
              index === activeBottle 
                ? "opacity-70 scale-105" 
                : "opacity-40 scale-100"
            }`}
          >
            <img
              src={bottle.src}
              alt={bottle.alt}
              className="h-[50vh] md:h-[65vh] object-contain"
            />
          </div>
        ))}
      </div>

      {/* Subtle dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/50 to-primary/70 z-[1]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full border border-accent/30">
            <span className="text-accent font-semibold text-sm">Instant Approval • Fast Disbursement</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Get Stock Anytime —<br />
            <span className="text-accent">Instant Liquor Business Loans</span>
          </h1>
          
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Access KSh 5,000 to 300,000 with 10% flat interest. Funds disbursed directly to your supplier in under 24 hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/apply">
              <Button variant="hero" size="lg" className="w-full sm:w-auto text-base">
                Apply Now
                <ArrowRight />
              </Button>
            </Link>
            <Link to="/market">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto text-base bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
              >
                Explore Market
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 border border-primary-foreground/20">
              <div className="text-2xl md:text-3xl font-bold text-accent">5K-300K</div>
              <div className="text-xs md:text-sm text-primary-foreground/80">Loan Range (KSh)</div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 border border-primary-foreground/20">
              <div className="text-2xl md:text-3xl font-bold text-accent">7 Days</div>
              <div className="text-xs md:text-sm text-primary-foreground/80">Duration</div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 border border-primary-foreground/20">
              <div className="text-2xl md:text-3xl font-bold text-accent">10%</div>
              <div className="text-xs md:text-sm text-primary-foreground/80">Flat Interest</div>
            </div>
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-4 border border-primary-foreground/20">
              <div className="text-2xl md:text-3xl font-bold text-accent">&lt;24 hrs</div>
              <div className="text-xs md:text-sm text-primary-foreground/80">Turnaround</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
