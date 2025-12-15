import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-hero overflow-hidden">
      {/* Liquor bottle silhouettes background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="absolute bottom-0 left-0 w-full h-2/3" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMax slice">
          {/* Whiskey bottle */}
          <path d="M100 600 L100 400 L90 380 L90 340 L110 340 L110 380 L100 400 L120 400 L120 600 Z" fill="currentColor" className="text-primary-foreground" />
          {/* Wine bottle */}
          <path d="M250 600 L250 350 L240 320 L240 280 L260 280 L260 320 L250 350 L270 350 L270 600 Z" fill="currentColor" className="text-primary-foreground" />
          {/* Vodka bottle */}
          <path d="M400 600 L400 380 L395 360 L395 320 L425 320 L425 360 L420 380 L420 600 Z" fill="currentColor" className="text-primary-foreground" />
          {/* Cognac bottle */}
          <path d="M550 600 L540 450 L530 420 L530 380 L570 380 L570 420 L560 450 L570 600 Z" fill="currentColor" className="text-primary-foreground" />
          {/* Gin bottle */}
          <path d="M700 600 L700 400 L690 370 L690 330 L730 330 L730 370 L720 400 L720 600 Z" fill="currentColor" className="text-primary-foreground" />
          {/* Rum bottle */}
          <path d="M850 600 L850 420 L840 390 L840 350 L880 350 L880 390 L870 420 L870 600 Z" fill="currentColor" className="text-primary-foreground" />
          {/* Tequila bottle */}
          <path d="M1000 600 L1000 380 L990 350 L990 300 L1030 300 L1030 350 L1020 380 L1020 600 Z" fill="currentColor" className="text-primary-foreground" />
          {/* Brandy bottle */}
          <path d="M1120 600 L1110 440 L1100 400 L1100 360 L1140 360 L1140 400 L1130 440 L1140 600 Z" fill="currentColor" className="text-primary-foreground" />
        </svg>
      </div>
      
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
    </section>
  );
};

export default Hero;
