import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/zion-link-logo.jpg";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Zion Link Technologies" className="h-12 w-12 object-contain" />
              <div>
                <h3 className="text-xl font-bold">
                  Stock <span className="text-accent">24/7</span>
                </h3>
                <p className="text-xs text-primary-foreground/60">
                  By Zion Link Technologies
                </p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 mb-2">
              Instant liquor business loans. Access working capital in under 24 hours.
            </p>
            <p className="text-xs text-primary-foreground/60 italic">
              Growing With You
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/how-it-works" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/market" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Market
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-accent" />
                <a href="tel:+254723037650" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  +254 723 037650
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-accent" />
                <a href="tel:+254112876759" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  +254 112 876759
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-accent" />
                <a href="mailto:support@zionlinks.example" className="text-primary-foreground/80 hover:text-accent transition-colors">
                  support@zionlinks.example
                </a>
              </li>
            </ul>
          </div>

          {/* Location & WhatsApp */}
          <div>
            <h4 className="font-semibold mb-4">Visit Us</h4>
            <div className="flex items-start gap-2 mb-4 text-sm">
              <MapPin size={16} className="text-accent mt-0.5" />
              <address className="text-primary-foreground/80 not-italic">
                Kimson Plaza, Eastern Bypass<br />
                2nd Floor
              </address>
            </div>
            <a
              href="https://wa.me/254723037650"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="hero" size="sm" className="w-full">
                <MessageCircle size={16} />
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-6 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Zion Link Technologies. All rights reserved.</p>
          <p className="mt-2">Created by Laban Panda Khisa</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
