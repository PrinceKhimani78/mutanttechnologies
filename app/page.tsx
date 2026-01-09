import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ServiceMarquee } from "@/components/ServiceMarquee";
import { Ongoing } from "@/components/Ongoing";
import { Services } from "@/components/Services";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-dark-slate overflow-hidden">
      <Navbar />
      <Hero />
      <ServiceMarquee />
      <Ongoing />
      <Services />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
