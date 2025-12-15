import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import omarImage from "@/assets/omar-laisa.png";
import jacksonImage from "@/assets/jackson-onyago.jpg";

interface Founder {
  id: string;
  name: string;
  title: string;
  image_url: string | null;
}

const About = () => {
  const [directors, setDirectors] = useState<Founder[]>([]);
  const [loading, setLoading] = useState(true);

  // Local image mapping for existing assets
  const localImages: Record<string, string> = {
    '/assets/omar-laisa.png': omarImage,
    '/assets/jackson-onyago.jpg': jacksonImage,
  };

  useEffect(() => {
    const fetchDirectors = async () => {
      const { data, error } = await supabase
        .from('founders')
        .select('id, name, title, image_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setDirectors(data);
      }
      setLoading(false);
    };

    fetchDirectors();
  }, []);

  const getImageSrc = (imageUrl: string | null) => {
    if (!imageUrl) return '/placeholder.svg';
    if (localImages[imageUrl]) return localImages[imageUrl];
    return imageUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
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
              {loading ? (
                <>
                  <Card className="bg-card/10 backdrop-blur-sm border-primary-foreground/20 overflow-hidden">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <div className="p-6 text-center">
                      <Skeleton className="h-8 w-48 mx-auto mb-2" />
                      <Skeleton className="h-5 w-24 mx-auto" />
                    </div>
                  </Card>
                  <Card className="bg-card/10 backdrop-blur-sm border-primary-foreground/20 overflow-hidden">
                    <Skeleton className="aspect-[3/4] w-full" />
                    <div className="p-6 text-center">
                      <Skeleton className="h-8 w-48 mx-auto mb-2" />
                      <Skeleton className="h-5 w-24 mx-auto" />
                    </div>
                  </Card>
                </>
              ) : (
                directors.map((director) => (
                  <Card key={director.id} className="bg-card/10 backdrop-blur-sm border-primary-foreground/20 overflow-hidden hover:shadow-hover transition-all duration-300">
                    <div className="aspect-[3/4] overflow-hidden">
                      <img 
                        src={getImageSrc(director.image_url)} 
                        alt={director.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-2xl font-bold text-primary-foreground mb-2">
                        {director.name}
                      </h3>
                      <p className="text-accent font-semibold">{director.title}</p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-card/10 backdrop-blur-sm border-primary-foreground/20 p-8">
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