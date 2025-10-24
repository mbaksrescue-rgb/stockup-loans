import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/zion-link-logo.jpg";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/how-it-works", label: "How It Works" },
    { to: "/market", label: "Market" },
    { to: "/about", label: "About" },
    { to: "/faqs", label: "FAQs" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-primary-foreground/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Zion Link Technologies" className="h-10 w-10 object-contain" />
            <div className="flex flex-col">
              <div className="text-lg font-bold text-primary-foreground leading-tight">
                Stock <span className="text-accent">24/7</span>
              </div>
              <span className="text-xs text-primary-foreground/80 leading-tight hidden sm:block">by Zion Link Technologies</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  location.pathname === link.to
                    ? "text-accent"
                    : "text-primary-foreground/90"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {isAdmin && <Link to="/admin"><Button variant="outline" size="sm">Admin</Button></Link>}
                <Link to="/apply"><Button variant="hero" size="sm">Apply Now</Button></Link>
                <Button variant="outline" size="sm" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
              </>
            ) : (
              <>
                <Link to="/auth"><Button variant="outline" size="sm">Sign In</Button></Link>
                <Link to="/apply"><Button variant="hero" size="sm">Apply Now</Button></Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary-foreground"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-in fade-in slide-in-from-top-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? "text-accent"
                    : "text-primary-foreground/90 hover:text-accent"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/apply" onClick={() => setIsOpen(false)}>
              <Button variant="hero" size="sm" className="w-full">Apply Now</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
