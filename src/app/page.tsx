import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/footer";
import { getSetting } from "@/lib/api";

export default async function LandingPage() {
  const showFeatures = await getSetting('landing_showFeatures');
  const showPricing = await getSetting('landing_showPricing');

  const shouldShowFeatures = showFeatures !== 'false';
  const shouldShowPricing = showPricing !== 'false';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        {shouldShowFeatures && <FeaturesSection />}
        {shouldShowPricing && <PricingSection />}
      </main>
      <Footer />
    </div>
  );
}
