import Hero from "@/components/home/Hero";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";

const Home = () => {
  return (
    <div className="min-h-screen pb-16 md:pb-0">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <HowItWorksSection />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Home;
