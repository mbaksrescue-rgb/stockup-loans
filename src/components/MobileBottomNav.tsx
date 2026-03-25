import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, FileText, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/market", icon: ShoppingBag, label: "Market" },
    { to: "/apply", icon: FileText, label: "Apply" },
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: user ? "/dashboard" : "/auth", icon: User, label: user ? "Account" : "Sign In" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                isActive
                  ? "text-accent"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
