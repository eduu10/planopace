import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import Marquee from "@/components/marketing/Marquee";
import Features from "@/components/marketing/Features";
import ShirtPromo from "@/components/marketing/ShirtPromo";
import HowItWorks from "@/components/marketing/HowItWorks";
import Pricing from "@/components/marketing/Pricing";
import DownloadApp from "@/components/marketing/DownloadApp";
import Testimonials from "@/components/marketing/Testimonials";
import Brands from "@/components/marketing/Brands";
import FAQ from "@/components/marketing/FAQ";
import CTA from "@/components/marketing/CTA";
import Footer from "@/components/marketing/Footer";

export default function HomePage() {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Features />
        <DownloadApp />
        <ShirtPromo />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <Brands />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
