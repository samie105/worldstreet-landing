import Header from "../components/Header";
import HeroGlobe from "../components/HeroGlobe";
import WhyChooseSection from "../components/WhyChooseSection";
import TextRevealScroll from "../components/TextRevealScroll";
import DashboardPreview from "../components/DashboardPreview";
import TickerMarquee from "../components/TickerMarquee";
import OpportunitiesSlider from "../components/OpportunitiesSlider";
import FAQSection from "../components/FAQSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col w-full relative">
      <Header />
      <HeroGlobe />
      <OpportunitiesSlider />
      <TickerMarquee />

      <WhyChooseSection />

      <TextRevealScroll />
      <DashboardPreview />
      
      <FAQSection />

      <CTASection />
      <Footer />
    </main>
  );
}
