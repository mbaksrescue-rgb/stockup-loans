import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import bottleKenyaCane from "@/assets/bottle-kenya-cane.png";
import bottleJohnnieWalker from "@/assets/bottle-johnnie-walker.png";
import bottleCounty from "@/assets/bottle-county.png";
import bottleGilbeys from "@/assets/bottle-gilbeys.png";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent"></div>
      
      {/* Animated amber glow effect */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
      
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

      {/* Bottles Display Section */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Table surface */}
        <div className="relative h-4 bg-gradient-to-r from-amber-900/80 via-amber-800/90 to-amber-900/80 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-700/20 to-transparent"></div>
        </div>
        
        {/* Bottles container */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-end gap-2 sm:gap-4 md:gap-8 px-4">
          <img 
            src={bottleKenyaCane} 
            alt="Kenya Cane" 
            className="h-32 sm:h-40 md:h-52 lg:h-64 object-contain opacity-0 animate-drop-in drop-shadow-2xl"
            style={{ animationDelay: '0.2s' }}
          />
          <img 
            src={bottleJohnnieWalker} 
            alt="Johnnie Walker" 
            className="h-36 sm:h-44 md:h-56 lg:h-72 object-contain opacity-0 animate-drop-in drop-shadow-2xl"
            style={{ animationDelay: '0.4s' }}
          />
          <img 
            src={bottleCounty} 
            alt="County" 
            className="h-32 sm:h-40 md:h-52 lg:h-64 object-contain opacity-0 animate-drop-in drop-shadow-2xl"
            style={{ animationDelay: '0.6s' }}
          />
          <img 
            src={bottleGilbeys} 
            alt="Gilbey's Gin" 
            className="h-34 sm:h-42 md:h-54 lg:h-68 object-contain opacity-0 animate-drop-in drop-shadow-2xl"
            style={{ animationDelay: '0.8s' }}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
