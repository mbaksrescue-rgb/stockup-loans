import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import omarImage from "@/assets/omar-laisa.png";
import jacksonImage from "@/assets/jackson-onyago.jpg";

const About = () => {
  const directors = [
    {
      name: "Omar Laisa",
      role: "Director",
      image: omarImage,
      order: "1st"
    },
    {
      name: "Jackson Onyago",
      role: "Director",
      image: jacksonImage,
      order: "2nd"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
              About <span className="text-accent">Zion Link Technologies</span>
            </h1>
            <p className="text-lg text-primary-foreground/90 mb-4">
              Growing With You
            </p>
            <p className="text-primary-foreground/80 leading-relaxed">
              At Zion Link Technologies, we are committed to empowering liquor businesses across Kenya 
              with instant access to working capital. Through our Stock 24/7 product, we provide fast, 
              reliable financing solutions that help bars, liquor stores, restaurants, and wines & spirits 
              outlets maintain optimal stock levels and grow their businesses.
            </p>
          </div>

          <div className="max-w-5xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-center text-primary-foreground mb-12">
              Our <span className="text-accent">Directors</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {directors.map((director) => (
                <Card key={director.name} className="bg-white/10 backdrop-blur-sm border-primary-foreground/20 overflow-hidden hover:shadow-elegant transition-all duration-300">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={director.image} 
                      alt={director.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <p className="text-sm text-accent font-semibold mb-1">{director.order} Director</p>
                    <h3 className="text-2xl font-bold text-primary-foreground mb-2">
                      {director.name}
                    </h3>
                    <p className="text-primary-foreground/80">{director.role}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-primary-foreground/20 p-8">
              <h2 className="text-2xl font-bold text-primary-foreground mb-4 text-center">
                Our <span className="text-accent">Mission</span>
              </h2>
              <p className="text-primary-foreground/80 leading-relaxed text-center mb-6">
                To provide fast, accessible, and reliable financial solutions that empower liquor businesses 
                to thrive and grow in a competitive market.
              </p>
              <h2 className="text-2xl font-bold text-primary-foreground mb-4 text-center">
                Our <span className="text-accent">Vision</span>
              </h2>
              <p className="text-primary-foreground/80 leading-relaxed text-center">
                To be the leading financial technology partner for liquor businesses across Kenya, 
                enabling sustainable growth and success for our clients.
              </p>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
